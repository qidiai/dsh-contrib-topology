# @qidiai/dsh-contrib-router

可解释贝叶斯 Subagent 路由插件（DeepSeek Harness 编排套件之一）：从观测到的运行历史为各 provider 打分并排序。

- **7 维核心**：success / capability / latency / tokenCost / freshness / stability / confidence（贝叶斯率 + Wilson 下界 + 时间衰减）
- **冷却**：最近一次失败后 30 分钟冷却（排名归零但保留可解释分量）
- **Remote**：`rank(task, candidates?)` 返回带每维分量与理由的排序；`profiles()` 返回全部 provider 画像
- **路由 tab**：Settings → Plugins → Routing

数据来源：监听 `subagent/start` → `subagent/end`（纯旁路），按 provider 维护观察环形缓冲。

套件：`@qidiai/dsh-contrib-topology` / `-observe` / `-router` / `-orchestrator` / `-mcp-bridge`（仓库 `qidiai/dsh-contrib-topology`）。
