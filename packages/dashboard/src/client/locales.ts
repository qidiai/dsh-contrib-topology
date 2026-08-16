/** Copy dictionaries for the dashboard Settings section. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginDashboard'

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  tab: '套件仪表盘',
  title: 'ai-bridge 套件',
  subtitle: '一个 tab 聚合五件套实时状态',
  refresh: '刷新',
  empty: '正在聚合套件状态…',
  'status.ok': '在线',
  'status.warn': '待确认',
  captured: '采集时间',
  'card.topology': 'topology · 依赖图',
  'card.observe': 'observe · 可观测性',
  'card.router': 'router · 贝叶斯路由',
  'card.orchestrator': 'orchestrator · 编排',
  'card.mcpBridge': 'mcp-bridge · MCP 桥接',
  'summary.plugins': '插件',
  'summary.services': '服务',
  'summary.subagents': '子代理',
  'summary.mcp': 'MCP',
  'summary.edges': '边',
  'topology.goto': '完整拓扑图见 topology tab（本卡只读摘要，SVG 渲染器不重复维护）',
  'body.noData': '暂无数据',
  'rank.cooling': '冷却',
} satisfies Record<string, string>

/** Dashboard locale key union. */
export type DashboardLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  tab: 'Suite Dashboard',
  title: 'ai-bridge Suite',
  subtitle: 'One tab for all five plugins',
  refresh: 'Refresh',
  empty: 'Aggregating suite state…',
  'status.ok': 'OK',
  'status.warn': 'Pending',
  captured: 'Captured',
  'card.topology': 'topology · graph',
  'card.observe': 'observe · observability',
  'card.router': 'router · bayesian',
  'card.orchestrator': 'orchestrator · orchestration',
  'card.mcpBridge': 'mcp-bridge · MCP',
  'summary.plugins': 'Plugins',
  'summary.services': 'Services',
  'summary.subagents': 'Subagents',
  'summary.mcp': 'MCP',
  'summary.edges': 'Edges',
  'topology.goto': 'Full graph lives in the topology tab (read-only summary here — no duplicated renderer)',
  'body.noData': 'No data yet',
  'rank.cooling': 'Cooling',
} satisfies Record<DashboardLocaleKey, string>
