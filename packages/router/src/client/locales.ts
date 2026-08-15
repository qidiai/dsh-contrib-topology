/** Copy dictionaries for the router Settings section. */

/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginRouter'

/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
  tab: '路由',
  title: '可解释 Subagent 路由',
  'stats.providers': '提供方',
  'stats.calls': '调用',
  'stats.successes': '成功',
  refresh: '刷新',
  empty: '暂无路由观测。触发一次 subagent 委托后回来查看。',
  'field.task': '任务描述',
  'field.candidates': '候选提供方（逗号分隔，留空=全部）',
  'btn.rank': '打分排序',
  'rank.title': '排名结果',
  'rank.score': '得分',
  'rank.category': '类别',
  'rank.reason': '理由',
  'rank.cooling': '冷却中',
  'profile.success': '成功率',
  'profile.confidence': '置信度',
  'profile.freshness': '新鲜度',
  'profile.stability': '稳定性',
  'profile.latency': '平均耗时',
  'profile.tokens': '均耗 Token',
  'profile.lastSuccess': '最近成功',
  'profile.lastFailure': '最近失败',
} satisfies Record<string, string>

/** Router locale key union. */
export type RouterLocaleKey = keyof typeof zh

/** English dictionary checked against the Chinese key set. */
export const en = {
  tab: 'Routing',
  title: 'Explainable Subagent Routing',
  'stats.providers': 'Providers',
  'stats.calls': 'Calls',
  'stats.successes': 'Successes',
  refresh: 'Refresh',
  empty: 'No routing observations yet. Trigger a subagent delegation, then check back.',
  'field.task': 'Task description',
  'field.candidates': 'Candidates (comma-separated; empty = all)',
  'btn.rank': 'Rank',
  'rank.title': 'Ranking',
  'rank.score': 'Score',
  'rank.category': 'Category',
  'rank.reason': 'Reason',
  'rank.cooling': 'Cooling',
  'profile.success': 'Success',
  'profile.confidence': 'Confidence',
  'profile.freshness': 'Freshness',
  'profile.stability': 'Stability',
  'profile.latency': 'Avg duration',
  'profile.tokens': 'Avg tokens',
  'profile.lastSuccess': 'Last success',
  'profile.lastFailure': 'Last failure',
} satisfies Record<RouterLocaleKey, string>
