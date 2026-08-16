# @qidiai/dsh-contrib-mcp-bridge

MCP 多服务器编排插件（DeepSeek Harness 编排套件之一）：一个入口管所有 MCP 服务器。

- **不重造连接层**：`dsh-mcp-client` 本身就是完整桥接（stdio/streamable-http、`mcp__` 工具注册、指数退避重连、HMR、serverName 唯一性）
- **聚合配置热更新**：`ai-bridge-mcp` settings namespace 持有 `servers[]`，运行时增删即时生效（经 `ctx.plugin()` spawn/dispose 各实例）
- **Remote**：`snapshot()`（各服务器状态 + 工具数）、`addServer()`、`removeServer()`
- **Bridge tab**：Settings → Plugins → MCP Bridge

**白捡集成**：`mcp__*` 工具自动带 `source: 'mcp'` 进 observe 时间线/统计（设计之初预留），调用同时进 router 历史。

设计文档见 `DESIGN.md`。套件：`@qidiai/dsh-contrib-topology` / `-observe` / `-router` / `-orchestrator` / `-mcp-bridge`（仓库 `qidiai/dsh-contrib-topology`）。
