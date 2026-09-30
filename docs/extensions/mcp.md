# koatty_mcp — MCP Server 宿主

`koatty_mcp` 把 Service 方法以 **MCP(Model Context Protocol)** 的
tools / resources / prompts 形式声明式暴露给 AI 客户端,完整复用框架既有的
IoC 容器、DTO 校验、AOP、请求作用域与可观测性——不引入第二套编程模型。

> 1.0.0 首发版本;协议状态机由官方 `@modelcontextprotocol/sdk`(peer 依赖)实现。

## 安装

```bash
pnpm add koatty_mcp @modelcontextprotocol/sdk
```

## 声明工具

输入 schema 直接来自既有的 `@Validated({ types: [Dto] })` —— **校验 HTTP body
的同一个 DTO 就是工具的入参契约**,不引入第二套参数装饰器词汇:

```ts
import { Tool, Resource, Prompt } from 'koatty_mcp';

@Service()
export class OrderTools {
  @Autowired() private orders: OrderService;

  @Tool({
    name: 'order_query',
    description: 'Query order status by order number',
    annotations: { readOnlyHint: true },
  })
  @Validated({ async: false, types: [QueryOrderDto] })
  async query(input: QueryOrderDto) {
    return this.orders.findByNo(input.orderNo);
  }

  @Tool({
    name: 'order_refund',
    description: 'Refund an order',
    annotations: { destructiveHint: true },
    requireApproval: true,        // 人工审批门(fail closed)
    scopes: ['order:refund'],     // 调用方 scope,每次传输都校验
  })
  @Validated({ async: false, types: [RefundDto] })
  async refund(input: RefundDto) { /* ... */ }

  @Resource({ uri: 'order://{orderNo}', mimeType: 'application/json' })
  async orderResource(params: { orderNo: string }) { /* ... */ }

  @Prompt({ name: 'refund_policy', description: 'Refund policy template' })
  refundPrompt() { return 'Refunds are processed within 3 business days.'; }
}
```

要点:

- 处理器实例从 IoC 容器解析(singleton/request scope),不走临时构造;
- 每次调用运行在既有请求作用域与 AsyncLocalStorage 上下文内,
  `ctx.principal`、`ctx.mcpSessionId`、`ctx.signal`、`ctx.progress()` 直接可用;
- 调用参数经 `koatty_validation` 白名单校验:未知字段剥离,非法值返回
  JSON-RPC `-32602`;**未声明 DTO 的工具收到非空参数同样返回 `-32602`**(fail closed);
- `strict` 画像下 `destructiveHint` 工具默认要求审批,除非显式 `requireApproval: false`。

## 人工审批(fail closed)

审批基于**持久化、一次性**的票据:

- 审批请求持久化到 `KeyValueStore`(需提供原子 `compareAndSet`),进程重启后
  可用 `resume(id, context)` 恢复,且上下文指纹(tool/caller/session/args)必须
  与原请求一致才可继续;
- 票据消费后写墓碑,不可复用;拒绝、超时、后端故障都**不执行**工具;
- Host 层与 Guard 审批服务只有一层超时判定,审计保证每 次调用恰好一条终态记录。

```ts
const approval = createApprovalService({
  store: redisStore,          // 需 compareAndSet
  timeoutMs: 300_000,
  notify: ticket => sendToReviewer(ticket),
});
```

## 宿主与传输

```ts
import { createMcpHost, createApiKeyAuth, createMcpHttpAdapter } from 'koatty_mcp';

const host = createMcpHost({
  app: this.app,
  security: {
    auth: createApiKeyAuth({ keys: { 'svc-key': ['order:refund'] } }),
    strict: true,
    allowedOrigins: ['https://app.example.com'],   // Origin 白名单(防 DNS rebinding)
    onApproval: event => metrics.record(event),
  },
});

const adapter = createMcpHttpAdapter({ host, sessionful: true, maxSessions: 200, sessionTtlMs: 600_000 });
```

- 认证失败统一返回 `InvalidRequest`,不泄露资源存在性;
- token 缺少 `sub`/`client_id` 会被拒绝,不存在「所有调用共享匿名主体」;
- 会话有数量上限与 idle TTL,容量满返回 `503`;
- 审计(`audit.record`)覆盖每次调用:preflight 拒绝、审批、取消、执行错误
  各自恰有一条终态记录。

## 与 Guard / LLM 组合

- `koatty_guard` 的审批服务可作为 `security.approval` 后端,共享票据存储;
- `koatty_llm` 的 `withTools` 可把本宿主作为工具执行器。

## 回归验证

```bash
pnpm --filter koatty_mcp test
```
