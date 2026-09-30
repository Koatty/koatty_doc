# koatty_guard — AI 安全护栏

`koatty_guard` 提供面向 AI 调用链的护栏:脱敏、提示注入检查、人工审批、
限流与审计。它构建在**既有 AOP 实现**之上(`koatty_container` 的 `@Around`
管线),不引入新的 Guard 基类或装饰器栈。

> 1.0.0 首发版本。

## 设计约束

- 服务是普通类,**一个** `GuardAspect` 实现 `IAspect`,以单个 `@Around`
  串联整条管线:脱敏 → 内容检查 → 限流 → 审批 → 审计;
- 规则式检查只能捕获**已知**模式;主要防线始终是 `koatty_mcp` 的
  权限 scope 与人工审批;
- 审计默认不记录提示词与模型输出**原文**(`captureContent: true` 显式开启,
  且开启后必须显式注入 masker,本包不隐式依赖)。

## 安装

```bash
pnpm add koatty_guard
```

## 审批:持久化、一次性、绑定调用方

审批票据是整个护栏里最重的机制:

- `request(ticket)` 把审批持久化到 `KeyValueStore`(要求原子 `compareAndSet`,
  内存实现仅用于测试),超时前等待 `approve` / `reject`;
- 票据**一次性**:决策后写墓碑,不可二次消费;
- 票据与**调用方指纹**绑定:tool / caller / session / requestId / args 的
  规范化哈希;进程重启后 `resume(id, context)` 必须指纹一致才可继续,
  换调用方或改参数的复用会被拒绝(`approval-context-mismatch`);
- 过期与已消费票据会被清理,容量上限(`maxLocalTickets`)只统计活跃票据,
  不会因累计票据把审批永久打满;
- 审批后端静默/故障时 fail closed(返回 `approval-backend-failed`),
  不会放行执行。

```ts
import { createApprovalService } from 'koatty_guard';

const approval = createApprovalService({
  store: redisStore,          // 需原子 compareAndSet
  timeoutMs: 300_000,
  maxLocalTickets: 10_000,
  notify: ticket => sendToReviewer(ticket),
});
```

## 脱敏:精确键名 + 凭据文本

- 键名规则按**规范化后的精确匹配**:`password`、`api_key`、`accessToken`、
  `sessionId` 等;`total_tokens`、`nextPageToken`、`tokenizer` 这类业务字段
  **不再误伤**;
- 文本规则额外捕获 Bearer token、带凭据的 URL(`scheme://user:pass@host`)、
  PEM 私钥块,以及邮箱/手机号/身份证号;
- `Buffer`、`Map`、`Set` 会被递归遍历。

## 内容检查与审计

- 内容检查遍历 Map/Set/Buffer/键名,做 UTF-8 解码、NFKC/零宽字符/常见同形字
  规范化后匹配已知注入模式;它是**启发式防线**,不是注入防御的保证;
- 审计对 Buffer/Map/Set/Array 只记录**类型与大小**,不落原始内容;
- 审计失败(掩码器/sink 抛错)不改变业务结果;每次调用产生**恰好一条**
  稳定终态审计记录(拒绝、超时、取消各自有稳定错误码,不重复审计)。

## 与 MCP / LLM 组合

- `koatty_mcp` 的 `security.approval` 可直接使用这里的审批服务;
- LLM 调用的出参/入参脱敏建议在业务层以 `createMaskingService()` 显式执行,
  trace 的 `captureContent` 需要显式注入 masker(见 `koatty-trace`)。

## 回归验证

```bash
pnpm --filter koatty_guard test
```
