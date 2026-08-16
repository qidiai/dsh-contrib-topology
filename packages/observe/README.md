# @qidiai/dsh-contrib-observe

非侵入式可观测性插件（DeepSeek Harness 编排套件之一）：运行时调用时间线 + 统计面板 + 配置热更新。

- **时间线**：工具调用 / LLM 流分组、类型与结果筛选、成败着色、MCP 标记
- **统计面板**：工具调用排行（次数/失败/错误率）、模型耗时排行（流数/平均耗时/chunk）
- **配置热更新**：`ai-bridge-observe` settings namespace 运行时调整环形缓冲容量与采集开关

事件模型（`agent`/`outcome`/`durationMs`/`features`/`source`）即贝叶斯路由的训练数据格式；`mcp__*` 工具自动标记 `source: 'mcp'`，未来 MCP 桥接零改动覆盖。

套件：`@qidiai/dsh-contrib-topology` / `-observe` / `-router` / `-orchestrator` / `-mcp-bridge`（仓库 `qidiai/dsh-contrib-topology`）。
