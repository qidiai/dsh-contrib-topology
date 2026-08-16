import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Aggregates the five plugins' live state by calling their Remotes directly:
 * topology.graph(), observe.snapshot(), router.profiles(),
 * orchestrator.snapshot(), mcp-bridge.snapshot(). Each card shows a compact
 * status line; a refresh button re-polls everything.
 */
import { useCallback, useEffect, useState } from 'react';
import styles from './DashboardTab.module.css';
const CARD_KEYS = ['topology', 'observe', 'router', 'orchestrator', 'mcpBridge'];
function fmtTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    return d.toLocaleTimeString();
}
/** Render the suite dashboard: five status cards in one tab. */
export function DashboardTab({ status, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);
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
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsx("span", { className: styles.subtitle, children: t('subtitle') }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), disabled: busy, children: busy ? '…' : t('refresh') })] }), data === null && _jsx("div", { className: styles.empty, children: t('empty') }), data !== null && (_jsxs(_Fragment, { children: [_jsx("div", { className: styles.grid, children: CARD_KEYS.map((key) => (_jsxs("div", { className: `${styles.card} ${data[key].ok ? styles.ok : styles.warn}`, children: [_jsx("div", { className: styles.cardName, children: t(`card.${key}`) }), _jsx("div", { className: styles.cardStatus, children: data[key].ok ? t('status.ok') : t('status.warn') }), _jsx("div", { className: styles.cardDetail, title: data[key].detail, children: data[key].detail })] }, key))) }), _jsxs("div", { className: styles.footer, children: [t('captured'), ": ", fmtTime(data.capturedAt)] })] }))] }));
}
//# sourceMappingURL=DashboardTab.js.map