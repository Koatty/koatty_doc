# koatty_llm — LLM 调用抽象

`koatty_llm` 为所有 LLM 供应商提供**一个**调用接口,并内置生产调用所需的
可靠性、预算与安全管线。刻意**不包含**:agent 编排 DSL、多智能体框架。

> 1.0.0 首发版本。`koatty_validation` 为必需依赖;`koatty_store`(分布式 token
> 计数)与 `koatty_cacheable`(响应缓存)为可选 peer——实现约定方法的
> 自定义 Redis/DB 客户端同样可用。

## 安装

```bash
pnpm add koatty_llm
```

## 使用

```ts
import { createOpenAiCompatibleProvider, createLlmClient } from 'koatty_llm';

const llm = createLlmClient({
  providers: [
    createOpenAiCompatibleProvider({ name: 'openai', baseUrl: 'https://api.openai.com/v1', apiKey: process.env.OPENAI_API_KEY }),
    createOpenAiCompatibleProvider({ name: 'local', baseUrl: 'http://127.0.0.1:11434/v1' }),
  ],
  routes: {
    // 逻辑模型名 -> provider + 供应商侧模型,按序 failover
    default: { model: 'default', provider: 'openai', providerModel: 'gpt-4o-mini', fallbacks: ['local'] },
    local:   { model: 'local',   provider: 'local',  providerModel: 'llama3.1' },
  },
  reliability: { attempts: 2, backoffMs: 200, timeoutMs: 60_000, breakerThreshold: 5 },
  budget: { maxTokens: 200_000, scope: 'tenant', store: redisStore, defaultMaxTokens: 1024 },
  cache: cacheableService,
});

@Service()
export class SupportAgent {
  async answer(question: string, signal: AbortSignal) {
    // 返回 AsyncIterable,可接入框架的 streamSSE
    return llm.stream({
      model: 'default',
      messages: [{ role: 'user', content: question }],
      signal,                    // ctx.signal:中断会传播到供应商调用
      budgetScope: 'tenant-42',
    });
  }
}
```

## 能力一览

| 能力 | 说明 |
|---|---|
| 供应商抽象 | `createOpenAiCompatibleProvider`(OpenAI、Azure 兼容网关、vLLM/Ollama)与 `createAnthropicProvider`;均为 fetch + SSE,可注入代理/埋点 `fetchImpl` |
| 模型路由 | 逻辑模型名 → provider + 供应商模型 id;`fallbacks` 仅对可重试失败按序尝试 |
| 可靠性 | 单次尝试超时;仅对 **429/5xx** 指数退避抖动重试;按 provider+model 熔断(`resetBreakers()` 供管理端使用) |
| 预算 | 调用前预检 + 调用后结算,经 `BudgetStore` 的原子 `incrBy` 多实例共享一个计数器;超预算**中止调用**,绝不静默截断;单次预留默认上限 `defaultMaxTokens`(默认 1024) |
| 取消 | `options.signal` 传播到供应商,并在 chunk 间复查——中断在一次供应商往返内停止 |
| 结构化输出 | `schema`(供应商侧 JSON schema)+ `dto`(class-validator DTO);解析结果经 `koatty_validation` 校验,`validationRetries` 携带纠错信息重问一次 |
| 工具调用 | `withTools({ tools, registry, invoke })` 进程内运行工具循环:白名单在发布 tool-call 前检查、`maxRounds` 硬上限;工具异常转为模型可读结果 |
| 缓存 | 非流式 `complete()` 的精确匹配缓存(`cache: false` 绕过;`cacheKey` 作附加区分;每个 client 与 DTO 独立命名空间,坏命中自动回源) |
| 成本 | 按路由上的 `pricePer1kPrompt` / `pricePer1kCompletion` 提供 `estimateCost()` |

每个结果都携带 `model`、`provider`、`usage`、`finishReason`、`cached`
与可选 `cost`,可直接喂给 trace/指标层(`koatty-trace` 的 GenAI 记录器
会把这些写入 `genai.*` span 属性)。

## 错误分类

`LlmError` 子类告诉调用方该怎么处理:

| 错误 | 场景 | 可重试 |
|---|---|---|
| `LlmAbortError` | 调用方中断(`ctx.signal`) | 否 |
| `LlmTimeoutError` | 单次尝试超时 | 是 |
| `LlmBudgetError` | scope 预算耗尽(携带 `scope`/`used`/`max`) | 否 |
| `LlmValidationError` | 结构化输出非 JSON 或未过 DTO(携带 `issues`、`raw`) | 否 |
| `LlmUnavailableError` | 全部路由/尝试失败(携带 `attempts` 与末次错误码) | 视末次错误 |
| `LlmError` | 供应商 4xx/5xx 首次失败 | 仅 429/5xx |

## 回归验证

```bash
pnpm --filter koatty_llm test
```
