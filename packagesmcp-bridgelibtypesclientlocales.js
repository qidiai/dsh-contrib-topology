/** Copy dictionaries for the MCP bridge Settings section. */
/** Dictionary namespace owned by this plugin. */
export const NS = 'settings.pluginMcpBridge';
/** Simplified Chinese dictionary and key source of truth. */
export const zh = {
    tab: 'MCP 桥接',
    title: 'MCP 多服务器编排',
    'stats.servers': '服务器',
    refresh: '刷新',
    empty: '暂无 MCP 服务器。添加一个服务器开始桥接。',
    'field.serverName': 'serverName（唯一，[A-Za-z0-9_-]{1,32}）',
    'field.transport': '传输',
    'field.command': '命令（stdio）',
    'field.args': '参数（stdio，逗号分隔）',
    'field.url': 'URL（streamable-http）',
    'btn.add': '添加',
    'status.connected': '已连接',
    'status.reconnecting': '重连中',
    'status.failed': '失败',
    'status.stopped': '已停止',
    'tools.count': '工具',
    'btn.remove': '移除',
    'err.duplicate': 'serverName 已存在',
    'err.invalid': '请填写 serverName（和命令或 URL）',
};
/** English dictionary checked against the Chinese key set. */
export const en = {
    tab: 'MCP Bridge',
    title: 'MCP Multi-Server Orchestration',
    'stats.servers': 'Servers',
    refresh: 'Refresh',
    empty: 'No MCP servers yet. Add one to start bridging.',
    'field.serverName': 'serverName (unique, [A-Za-z0-9_-]{1,32})',
    'field.transport': 'Transport',
    'field.command': 'Command (stdio)',
    'field.args': 'Args (stdio, comma-separated)',
    'field.url': 'URL (streamable-http)',
    'btn.add': 'Add',
    'status.connected': 'Connected',
    'status.reconnecting': 'Reconnecting',
    'status.failed': 'Failed',
    'status.stopped': 'Stopped',
    'tools.count': 'Tools',
    'btn.remove': 'Remove',
    'err.duplicate': 'serverName already exists',
    'err.invalid': 'Provide serverName and a command or URL',
};
//# sourceMappingURL=locales.js.map