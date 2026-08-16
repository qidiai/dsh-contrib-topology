import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Five expandable cards, one per plugin. Read-only inline views (timeline /
 * ranking / history / servers) for the four data plugins; the topology card
 * shows a per-kind node summary and points to the topology tab for the full
 * SVG graph (which lives in the topology plugin's own tab — no duplicated
 * renderer). Configuration actions stay in each plugin's tab.
 */
import { useCallback, useEffect, useState } from 'react';
import styles from './DashboardTab.module.css';
const CARD_KEYS = ['topology', 'observe', 'router', 'orchestrator', 'mcpBridge'];
const EVENT_LABEL = {
    'tool.call': 'tool',
    'llm.stream': 'llm',
    'subagent.dispatch': 'sub',
};
function fmtTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleTimeString();
}
/** Render the suite dashboard: five expandable cards in one tab. */
export function DashboardTab({ status, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(null);
    const refresh = useCallback(async () => {
        setBusy(true);
        try {
            setData(await status());
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setBusy(false);
        }
    }, [status]);
    useEffect(() => { void refresh(); }, [refresh]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsx("span", { className: styles.subtitle, children: t('subtitle') }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), disabled: busy, children: busy ? '…' : t('refresh') })] }), data === null && _jsx("div", { className: styles.empty, children: t('empty') }), data !== null && (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.grid, children: CARD_KEYS.map((key) => (_jsxs("div", { className: `${styles.card} ${data[key].ok ? styles.ok : styles.warn} ${open === key ? styles.cardOpen : ''}`, children: [_jsxs("button", { type: "button", className: styles.cardHeader, onClick: () => setOpen((cur) => (cur === key ? null : key)), children: [_jsx("span", { className: styles.cardName, children: t(`card.${key}`) }), _jsx("span", { className: styles.cardDetail, title: data[key].detail, children: data[key].detail }), _jsx("span", { className: styles.cardToggle, children: open === key ? '▾' : '▸' })] }), open === key && (_jsx("div", { className: styles.cardBody, children: renderCardBody(key, data[key], t) }))] }, key))) }), _jsxs("div", { className: styles.footer, children: [t('captured'), ": ", fmtTime(data.capturedAt)] })] }))] }));
}
/** Read-only inline view per card (no duplicated heavyweight renderers). */
function renderCardBody(key, card, t) {
    switch (key) {
        case 'topology': {
            const s = card.summary;
            if (!s)
                return _jsx("div", { className: styles.bodyMuted, children: t('body.noData') });
            return (_jsxs("div", { className: styles.summary, children: [_jsxs("span", { children: [t('summary.plugins'), ": ", _jsx("b", { children: s.plugins })] }), _jsxs("span", { children: [t('summary.services'), ": ", _jsx("b", { children: s.services })] }), _jsxs("span", { children: [t('summary.subagents'), ": ", _jsx("b", { children: s.subagents })] }), _jsxs("span", { children: [t('summary.mcp'), ": ", _jsx("b", { children: s.mcps })] }), _jsxs("span", { children: [t('summary.edges'), ": ", _jsx("b", { children: s.edges })] }), _jsx("span", { className: styles.goto, children: t('topology.goto') })] }));
        }
        case 'observe': {
            const events = card.events ?? [];
            if (events.length === 0)
                return _jsx("div", { className: styles.bodyMuted, children: t('body.noData') });
            return (_jsx("div", { className: styles.list, children: events.map((e, i) => (_jsxs("div", { className: styles.row, children: [_jsx("span", { className: `${styles.kind} ${styles[`kind${e.kind.split('.').join('')}`] ?? styles.kindDefault}`, children: EVENT_LABEL[e.kind] ?? e.kind }), _jsx("span", { className: styles.rowName, title: e.name, children: e.name }), _jsx("span", { className: `${styles.outcome} ${e.outcome === 'success' ? styles.ok : styles.fail}`, children: e.outcome }), _jsxs("span", { className: styles.rowMeta, children: [e.source, e.durationMs !== undefined ? ` · ${e.durationMs}ms` : ''] })] }, i))) }));
        }
        case 'router': {
            const providers = card.providers ?? [];
            if (providers.length === 0)
                return _jsx("div", { className: styles.bodyMuted, children: t('body.noData') });
            return (_jsx("div", { className: styles.list, children: providers.map((p) => (_jsxs("div", { className: styles.row, children: [_jsx("span", { className: styles.rowName, title: p.name, children: p.name }), _jsxs("span", { className: styles.rowMeta, children: [p.calls, " calls / ", p.successes, " ok"] }), _jsx("span", { className: styles.scoreBar, title: `score ${p.successScore.toFixed(3)}`, children: _jsx("span", { className: styles.scoreFill, style: { width: `${Math.round(p.successScore * 100)}%` } }) }), _jsxs("span", { className: styles.rowMeta, children: [p.successScore.toFixed(2), p.coolingDown ? ` · ${t('rank.cooling')}` : ''] })] }, p.name))) }));
        }
        case 'orchestrator': {
            const history = card.history ?? [];
            if (history.length === 0)
                return _jsx("div", { className: styles.bodyMuted, children: t('body.noData') });
            return (_jsx("div", { className: styles.list, children: history.map((h, i) => (_jsxs("div", { className: styles.row, children: [_jsx("span", { className: styles.kindDefault, children: h.mode }), _jsx("span", { className: styles.rowName, title: h.task, children: h.task }), h.winner && _jsxs("span", { className: styles.rowMeta, children: ["\u2190 ", h.winner] }), _jsx("span", { className: `${styles.outcome} ${h.allOk ? styles.ok : styles.fail}`, children: h.allOk ? 'ok' : 'fail' }), _jsxs("span", { className: styles.rowMeta, children: [h.durationMs, "ms"] })] }, i))) }));
        }
        case 'mcpBridge': {
            const servers = card.servers ?? [];
            if (servers.length === 0)
                return _jsx("div", { className: styles.bodyMuted, children: t('body.noData') });
            return (_jsx("div", { className: styles.list, children: servers.map((s) => (_jsxs("div", { className: styles.row, children: [_jsx("span", { className: styles.rowName, title: s.serverName, children: s.serverName }), _jsx("span", { className: `${styles.outcome} ${s.status === 'connected' ? styles.ok : styles.fail}`, children: s.status }), _jsxs("span", { className: styles.rowMeta, children: [s.toolCount, " tools"] }), s.lastError && _jsxs("span", { className: styles.rowMeta, title: s.lastError, children: [s.lastError.slice(0, 24), "\u2026"] })] }, s.serverName))) }));
        }
    }
}
//# sourceMappingURL=DashboardTab.js.map