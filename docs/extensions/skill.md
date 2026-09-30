# Agent Skill:让 AI 代理掌握 Koatty 工程

Koatty 官方维护一份 **Agent Skill**(`koatty`):一份面向 AI 编码代理
(Claude Code、Cursor 等支持 Agent Skill 规范的工具)的工程知识包,
让代理在 Koatty 项目里直接"说对话、做对事"——用对装饰器、走对开发工作流、
守住框架不变量,而不是凭通用 Node.js 经验编造 API。

> Skill 源码随 `koatty_cli`(koatty-ai)同版本分发:
> `packages/koatty-ai/skills/koatty/`。CLI 与 Skill 的版本一一对应。

## 获取与安装

**方式一:新项目自动携带(推荐)**

```bash
koatty new my-app          # 或 --template mcp|agent
```

生成的项目自带 `.agents/skills/koatty/`,无需额外安装;
`--offline` 离线模式下同样包含(`--template-digest` 校验模板快照)。

**方式二:既有项目手动接入**

从 npm 包内复制(与已安装 CLI 同版本):

```bash
mkdir -p .agents/skills
cp -R node_modules/koatty_cli/skills/koatty .agents/skills/koatty
```

> 各代理工具按其技能目录约定接入:例如 Claude Code 可将
> `.agents/skills/koatty/` 复制或软链到项目级 `.claude/skills/koatty/`
> (或个人级 `~/.claude/skills/koatty/`);其它工具请参照各自文档。

**方式三:开发 MCP 在线检索(不落盘)**

```bash
koatty mcp
```

开发 MCP 暴露 `koatty_docs` 工具,`scope: framework` 可检索随包的版本化
Skill 内容——适合不想在项目里落盘、只想让代理按需查询的场景。

## 内容结构

```
.agents/skills/koatty/
├── SKILL.md                     # 入口:契约建立、指南路由、框架不变量
├── references/
│   ├── development.md           # 项目创建、CRUD、非交互计划、冲突与失败诊断
│   ├── framework.md             # HTTP/gRPC/WebSocket、DI、配置、校验、扩展
│   ├── mcp-agent.md             # 业务 MCP、LLM 流式、checkpointed Agent
│   └── verification.md          # 有意义的测试与部署证据
└── agents/
    └── openai.yaml              # OpenAI Agents 场景的等价配置
```

`SKILL.md` 强制代理先做四件事:

1. **建立实际契约**——先看项目的 package.json/lockfile/tsconfig,用
   `--version`、`--help`、`capabilities --json`、`doctor --json` 做
   feature detection;**版本号相同不等于本地 CLI 实现了某操作**;
2. **读静态 manifest**——`koatty manifest --validate`,先看 `unresolved` 与
   `mcp.coverage` 再信任 schema;`collectionMode: static` 只描述声明而非运行时注册;
3. **按需读 guide**——只读与请求相关的 references,不整包灌入上下文;
4. **守住框架不变量**——业务逻辑进 Service、用 `app.container` 与
   `app.paths.*`、DTO 命名与 Loader 对齐、不发明 `@Agent`/`@McpController`
   等不存在的装饰器、开发 MCP 与业务 MCP 的权限分离、审批失败不得绕过。

## 与开发工作流的关系

Skill 描述的正是 CLI 的 AI 开发工作流,二者同版本配套:

| 操作 | 命令 |
|---|---|
| 能力发现 | `koatty capabilities --json` / `koatty doctor --json` |
| 静态发现 | `koatty manifest --section tools --limit 20` |
| 计划与应用 | `koatty plan --spec <file> --save-plan --json` → `apply --plan <id> --yes --json` |
| 校验 | `koatty verify --checks types,test --json` |

Skill 明确要求代理区分 `preview` / `applied` / `completed` / `failed` 四种状态:
apply 成功只代表其配置的检查通过,行为/协议测试要另行运行;
计划失败后检查回执与当前文件,**不要重放已消费的计划**。

## 版本与升级

- Skill 与 CLI 同版本发布;升级 CLI 后重新执行方式二即可同步 Skill;
- 参考文档遵循 feature detection 原则,不把尚未发布的导出假定为已安装能力;
- 完整工程约定见主仓库 `docs/migration/phase-g-ai-development.md`。
