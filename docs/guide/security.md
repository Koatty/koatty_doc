# 安全画像与默认防护(Security Profile)

Koatty 5.x 引入**安全画像(Security Profile)**作为全框架的安全基线开关:
一套配置决定所有 fail-closed 防护的强度,而不是每个中间件各自为政。

> 本特性对应加固路线图 Phase A/B(ADR-102),详见框架仓库
> `docs/migration/phase-a-f-review-fixes.md`。

## 解析规则

画像名由环境变量解析,**`KOATTY_ENV` 优先于 `NODE_ENV`**:

```ts
import { resolveProfileName } from 'koatty_core';

// KOATTY_ENV=production(未设 NODE_ENV)⇒ 'strict'
// 只设 NODE_ENV=production           ⇒ 'strict'
// 其余                               ⇒ 'standard'
```

- **`strict`(生产)**:全部防护启用,默认值取最严格档;
- **`standard`(默认)**:防护启用,阈值适中;
- **`development`**:放宽便于本地调试,但不关闭安全审计。

非法的画像名/配置键/配置值会在启动时被拒绝(而非静默回退)。
解析结果以只读形式暴露在 `app.security` 上,Swagger、TypeORM 等组件
复用同一份画像环境判定,不会再出现「框架判生产、组件判开发」的分裂。

## `legacyDefaults` 的边界

`legacyDefaults` 只回退画像中**明确列出**的字段,方便灰度升级。
它**不是**全框架兼容模式:TLS 1.2 下限、凭据脱敏、CLI 沙箱、以及各缺陷修复
不提供安全降级入口。

## 默认防护清单(fail-closed)

以下默认在 strict/standard 画像下生效,升级到 5.x 后无需额外配置:

| 防护 | 默认行为 |
|---|---|
| 请求体解析 | 非法 Content-Type 返回 `415`,超限返回 `413`,解析失败返回 `400`,不再静默吞掉 |
| DTO 白名单 | `@Validated` 校验时剥离未知字段(white-list),未知字段不会进入业务层 |
| WebSocket Origin | 未配置画像时也默认校验 Origin;空 allowlist 拒绝一切 Origin,`ws.allowedOrigins` 显式放行(支持 `*.example.com` 通配) |
| `/metrics` 与健康检查 | 默认只信任**回环地址**;反向代理后的私网来源需显式 `allowCidrs`,健康详情需 ops token |
| ops 端点 | 运维端点要求 token,详细健康信息未带 token 时不暴露 |
| 请求 ID | 每个请求自动注入 `x-request-id`,错误响应携带 `requestId` 便于追踪 |
| TLS | HTTP/HTTPS 握手下限 TLS 1.2 |
| 错误脱敏 | 未捕获异常对外只返回 `Internal server error` + `requestId`,堆栈只进日志 |
| CLI 沙箱 | `koatty_cli` 写文件拒绝目录穿越与硬链接 inode 替换 |

## 反向代理部署注意

`/metrics` 的信任判断只看**直接 TCP 对端**:
在 k8s Ingress / Nginx 之后,所有请求的来源都是代理地址。两种正确姿势:

1. 代理部署在回环地址(同 Pod sidecar),直接放行;
2. 显式配置代理网段:

```ts
// config/middleware.ts(healthCheck 中间件配置)
createHealthCheckMiddleware({
  allowCidrs: ['10.0.0.0/8'],
  opsToken: process.env.OPS_TOKEN,
})
```

`X-Forwarded-For` **不参与**信任判断——它可被伪造,不能作为信任依据。

## 升级提示

从 4.x 升级时,若你的 WebSocket 被 403 拒绝、`/metrics` 突然 403,
属于上述默认值收紧所致,按对应条目显式配置即可;
完整迁移说明见 [v4 to v5](../migration/v4-to-v5.md)。
