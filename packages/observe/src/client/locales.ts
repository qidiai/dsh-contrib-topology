/** Copy dictionaries for the observability Settings section. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginObserve'

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  tab: '可观测性',
  title: '运行时调用时间线',
  'stats.total': '事件',
  'stats.tools': '工具调用',
  'stats.llm': 'LLM 流',
  'stats.errors': '失败',
  'stats.dropped': '已丢弃',
  refresh: '刷新',
  auto: '自动',
  empty: '暂无观测事件。触发一次工具调用或模型请求后回来查看。',
  'kind.tool': '工具',
  'kind.llm': '模型',
  'outcome.success': '成功',
  'outcome.error': '失败',
  'outcome.cancelled': '已取消',
  'source.mcp': 'MCP',
  'filter.kind': '类型',
  'filter.outcome': '结果',
  'filter.all': '全部',
  'filter.clear': '清除筛选',
  'group.tool': '工具调用',
  'group.llm': '模型流',
  'panel.title': '统计',
  'panel.errorRate': '错误率',
  'panel.topTools': '工具调用排行',
  'panel.topModels': '模型耗时排行',
  'panel.errors': '失败',
  'panel.chunks': 'chunk',
  'panel.empty': '暂无统计数据。',
} satisfies Record<string, string>

/** Observe locale key union. */
export type ObserveLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  tab: 'Observability',
  title: 'Runtime Call Timeline',
  'stats.total': 'Events',
  'stats.tools': 'Tool calls',
  'stats.llm': 'LLM streams',
  'stats.errors': 'Errors',
  'stats.dropped': 'Dropped',
  refresh: 'Refresh',
  auto: 'Auto',
  empty: 'No observed events yet. Trigger a tool call or model request, then check back.',
  'kind.tool': 'Tool',
  'kind.llm': 'Model',
  'outcome.success': 'Success',
  'outcome.error': 'Error',
  'outcome.cancelled': 'Cancelled',
  'source.mcp': 'MCP',
  'filter.kind': 'Kind',
  'filter.outcome': 'Outcome',
  'filter.all': 'All',
  'filter.clear': 'Clear filters',
  'group.tool': 'Tool calls',
  'group.llm': 'LLM streams',
  'panel.title': 'Statistics',
  'panel.errorRate': 'Error rate',
  'panel.topTools': 'Top tools',
  'panel.topModels': 'Model latency',
  'panel.errors': 'errors',
  'panel.chunks': 'chunks',
  'panel.empty': 'No statistics yet.',
} satisfies Record<ObserveLocaleKey, string>
