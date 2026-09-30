# 迁移指南:v4 到 v5

将 Koatty 应用从 4.x 升级到 5.x。5.x 是 AI 就绪的一代:框架内核完成安全加固
(Security Profile + fail-closed 默认),并新增 MCP / LLM / Guard 三个运行时包。

## 版本总览

| 包 | 5.x 版本 | 说明 |
|---|---|---|
| `koatty` | 5.0.0 | **major**:撤回实验性 API,HTTP/3 移出核心 |
| `koatty_serve` | 4.0.0 | **major**:连接归属与优雅排空重构 |
| `koatty_validation` | 5.0.0 | **major**:DTO 运行时实例转换、schema 规则保守化 |
| `koatty_testing` | 5.0.0 | **major** |
| `koatty_trace` | 2.5.0 | GenAI 记录器(`genai.*` span 属性) |
| `koatty_mcp` / `koatty_llm` / `koatty_guard` | 1.0.0 | **新包首发** |
| `koatty_http3` | 1.0.0 | experimental,独立包 |
| `koatty_cli` | 5.1.0 | `koatty manifest` / `koatty mcp`、写沙箱加固 |
| `koatty_typeorm` / `koatty_swagger` | 4.0.0 | 画像驱动的默认值 |
| `koatty_cacheable` / `koatty_schedule` / `koatty_serverless` | 6.0.0 / 7.0.0 / 6.0.0 | **major** |

## 破坏性变更

### 1. 实验性 API 撤回(`koatty` / `koatty_serve` major)

以下导出被撤回,静态 manifest 不再产出 `guards`/`interceptors` 字段:

```ts
// 已移除 —— 改用既有中间件/AOP 管线
UseGuard、UseInterceptor、IGuard、IInterceptor、SSE 装饰器、runSync、createIsolated
```

不要使用 `@Autowired({ lazy: true })`(此前文档中的错误示例)。
切面请使用 `koatty_container` 既有的 `@Around` / `@Before` / `@After`。

### 2. HTTP/3 移出核心(`koatty` major)

```ts
// 旧:从 koatty 导入
import { Http3Server } from 'koatty';
// 新:显式安装独立包
import { Http3Server } from 'koatty_http3';
```

`koatty_http3` 保持 experimental;`koatty_serve` 对它是 peer 依赖(兼容 3.5/4.x)。
未安装、原生后端不可用或 TLS 配置不支持时启动失败,**不再返回模拟就绪**。

### 3. `koatty_validation` 5.0

- DTO 入参现在被转换为**真实 DTO 实例**(`class-transformer`,不开启原始类型
  隐式转换):`Date` 字段、嵌套 DTO、DTO 数组按设计类型转换后再校验;
- 新增 `PARAM_DTO_KEY`:`@Validated({ types: [Dto] })` 的桥接元数据,
  `PARAM_CHECK_KEY` 语义不变;
- 静态 schema(`koatty_cli` 的 `koatty manifest`)对无法等价表达的规则输出
  `unresolved` 诊断,required 只由装饰器决定,**不再被 TS `?` 误导**;
  未装饰属性被跳过并标记 `dto.undecorated`。

### 4. `koatty_serve` 4.0

- HTTP 服务器连接归属重构:`close` 先排空(等待在途请求,SSE 客户端不被重置),
  最多等 5 秒后强制收尾;`/readyz` 在 drain 期间返回 503;
- WebSocket:未配置安全画像时也默认校验 Origin(空 allowlist 拒绝一切 Origin);
  载荷上限默认 1 MiB,慢消费者主动断开(1008)。

### 5. 安全默认收紧(全框架)

详见 [安全画像](../guide/security.md)。最常撞到的三条:

- `/metrics` 默认只信任回环地址,反代后需显式 `allowCidrs`;
- WebSocket 握手缺 Origin 头默认 403,需配置 `ws.allowedOrigins`;
- 安全配置键/类型/枚举非法时启动失败,不再静默回退。

### 6. peer 依赖对齐

`koatty_mcp` / `koatty_llm` 的 `koatty_validation` peer 为 `^5.0.0`;
`koatty_http3` 的 `koatty_serve` peer 兼容 `3.5.x / 4.x`。

## 新能力(可选接入)

- [koatty_mcp](../extensions/mcp.md):把 Service 方法暴露为 MCP tools/resources/prompts,
  DTO 复用 `@Validated`,人工审批 fail closed;
- [koatty_llm](../extensions/llm.md):多供应商 LLM 客户端,路由/重试/熔断/预算/缓存/工具循环;
- [koatty_guard](../extensions/guard.md):脱敏 → 内容检查 → 限流 → 审批 → 审计单切面管线;
- `koatty-trace` 2.5:GenAI 记录器,`genai.*` 属性默认不记录提示词与输出原文。

## 升级步骤建议

1. 升级全部 `@koatty/*` 与 `koatty_*` 依赖到 5.x 家族(peer 已互相对齐);
2. 全局搜索被撤回的导出(`UseGuard`、`runSync` 等),按第 1 节替换;
3. 若使用 HTTP/3:`pnpm add koatty_http3` 并调整 import;
4. 启动应用,按报错逐条处理安全默认收紧(多为显式放行配置);
5. 运行测试;`koatty_validation` 的 DTO 断言若依赖 plain object,改为断言实例;
6. 需要灰度时,用 `app.security` 的 `legacyDefaults` 回退**明列字段**(注意它不是
   全量兼容模式)。

## 详细迁移说明

细粒度的行为契约与边界,见框架仓库
[koatty-monorepo/docs/migration](https://github.com/koatty/koatty-monorepo/tree/main/docs/migration):
`phase-d-router-hotpath.md`、`phase-f-mcp-host.md`、`phase-f-audit-fixes.md`、
`phase-f-guard.md`、`phase-f-genai.md`、`phase-a-f-review-fixes.md`。
