import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * MCP bridge settings tab — multi-server orchestration view.
 *
 * Lists every bridge-managed MCP server (status + tool count), and lets you
 * add/remove servers at runtime. The host diff-drives mcp-client instances
 * from the `ai-bridge-mcp` settings namespace; this tab is the visible face.
 */
import { useCallback, useEffect, useState } from 'react';
import styles from './BridgeTab.module.css';
const STATUS_KEYS = {
    connected: 'status.connected',
    reconnecting: 'status.reconnecting',
    failed: 'status.failed',
    stopped: 'status.stopped',
};
/** Render the live MCP server list plus the add/remove controls. */
export function BridgeTab({ snapshot, addServer, removeServer, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [name, setName] = useState('');
    const [transport, setTransport] = useState('stdio');
    const [command, setCommand] = useState('');
    const [args, setArgs] = useState('');
    const [url, setUrl] = useState('');
    const [busy, setBusy] = useState(false);
    const refresh = useCallback(async () => {
        try {
            setData(await snapshot());
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [snapshot]);
    useEffect(() => { void refresh(); }, [refresh]);
    const runAdd = useCallback(async () => {
        if (!name.trim() || busy)
            return;
        const invalid = transport === 'stdio' ? !command.trim() : !url.trim();
        if (invalid) {
            setError(t('err.invalid'));
            return;
        }
        setBusy(true);
        setError(null);
        try {
            const server = {
                serverName: name.trim(),
                transport,
                ...(transport === 'stdio'
                    ? { command: command.trim(), ...(args.trim() ? { args: args.split(',').map((s) => s.trim()).filter(Boolean) } : {}) }
                    : { url: url.trim() }),
            };
            await addServer(server);
            setName('');
            setCommand('');
            setArgs('');
            setUrl('');
            await refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setBusy(false);
        }
    }, [name, transport, command, args, url, busy, addServer, refresh, t]);
    const runRemove = useCallback(async (serverName) => {
        try {
            await removeServer(serverName);
            await refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [removeServer, refresh]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    const servers = data?.servers ?? [];
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsxs("span", { className: styles.stat, children: [t('stats.servers'), ": ", servers.length] }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), children: t('refresh') })] }), _jsxs("div", { className: styles.addBox, children: [_jsx("input", { className: styles.input, placeholder: t('field.serverName'), value: name, onChange: (e) => setName(e.target.value) }), _jsxs("select", { className: styles.select, value: transport, onChange: (e) => setTransport(e.target.value), children: [_jsx("option", { value: "stdio", children: "stdio" }), _jsx("option", { value: "streamable-http", children: "streamable-http" })] }), transport === 'stdio' ? (_jsxs(_Fragment, { children: [_jsx("input", { className: styles.input, placeholder: t('field.command'), value: command, onChange: (e) => setCommand(e.target.value) }), _jsx("input", { className: styles.input, placeholder: t('field.args'), value: args, onChange: (e) => setArgs(e.target.value) })] })) : (_jsx("input", { className: styles.input, placeholder: t('field.url'), value: url, onChange: (e) => setUrl(e.target.value) })), _jsx("button", { className: styles.addBtn, type: "button", onClick: () => void runAdd(), disabled: busy || !name.trim(), children: busy ? '…' : t('btn.add') })] }), _jsxs("div", { className: styles.list, children: [servers.length === 0 && _jsx("div", { className: styles.empty, children: t('empty') }), servers.map((server) => (_jsxs("div", { className: styles.row, children: [_jsx("span", { className: styles.name, children: server.serverName }), _jsx("span", { className: `${styles.status} ${styles[server.status] ?? ''}`, children: t(STATUS_KEYS[server.status]) }), _jsxs("span", { className: styles.tools, children: [t('tools.count'), ": ", server.toolCount] }), server.lastError && _jsx("span", { className: styles.err, title: server.lastError, children: server.lastError }), _jsx("button", { className: styles.removeBtn, type: "button", onClick: () => void runRemove(server.serverName), children: t('btn.remove') })] }, server.serverName)))] })] }));
}
//# sourceMappingURL=BridgeTab.js.map