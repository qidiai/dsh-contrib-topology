# @qidiai/dsh-contrib-orchestrator

多 Agent 编排插件（DeepSeek Harness 编排套件之一）：五种分派模式 + 重试，经原生 subagent 委托执行。

- **五种模式**：parallel（限流并发）/ sequential / select / cascade（成功即停）/ merge + 每 agent 重试
- **执行接缝**：纯控制流引擎绑定 `ctx.subagents.start()`（替代 qidi 的 AgentHub/MergeEngine）
- **Remote**：`dispatch(request)`（任务 + 候选 + 模式）、`stats()`、`snapshot()`（计数 + 最近历史）
- **编排 tab**：Settings → Plugins → Orchestrator

套件：`@qidiai/dsh-contrib-topology` / `-observe` / `-router` / `-orchestrator` / `-mcp-bridge`（仓库 `qidiai/dsh-contrib-topology`）。
