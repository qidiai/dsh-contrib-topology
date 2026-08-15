import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Observability settings tab — newest-first timeline of tool calls and LLM
 * streams captured by the host gateway. M2 adds kind/outcome filtering and
 * groups the timeline into tool-call and LLM-stream sections (M1 was a flat
 * list); M3 grows the stats header into a full panel.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './ObserveTab.module.css';
const AUTO_INTERVAL_MS = 3_000;
function formatTime(iso) {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime()))
        return iso;
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
}
function formatDuration(ms) {
    if (ms === undefined)
        return '—';
    if (ms < 1_000)
        return `${ms}ms`;
    return `${(ms / 1_000).toFixed(2)}s`;
}
function dotClass(outcome) {
    if (outcome === 'success')
        return styles.dotSuccess ?? '';
    if (outcome === 'cancelled')
        return styles.dotCancelled ?? '';
    return styles.dotError ?? '';
}
/** Render the live tool/LLM observation timeline with filters and grouping. */
export function ObserveTab({ snapshot, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [auto, setAuto] = useState(true);
    const [kindFilter, setKindFilter] = useState('all');
    const [outcomeFilter, setOutcomeFilter] = useState('all');
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
    useEffect(() => {
        if (!auto)
            return;
        const timer = setInterval(() => { void refresh(); }, AUTO_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [auto, refresh]);
    /** Filtered events, newest first. */
    const filtered = useMemo(() => {
        if (!data)
            return [];
        return data.events.filter((e) => (kindFilter === 'all' || e.kind === kindFilter) &&
            (outcomeFilter === 'all' || e.outcome === outcomeFilter));
    }, [data, kindFilter, outcomeFilter]);
    /** Group the filtered timeline into tool-call and LLM-stream sections. */
    const groups = useMemo(() => {
        const tool = filtered.filter((e) => e.kind === 'tool.call');
        const llm = filtered.filter((e) => e.kind === 'llm.stream');
        return [
            { kind: 'tool.call', events: tool },
            { kind: 'llm.stream', events: llm },
        ].filter((g) => g.events.length > 0);
    }, [filtered]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    if (!data) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.empty, children: t('empty') }) });
    }
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsxs("span", { className: styles.stat, children: [t('stats.tools'), ": ", data.stats.toolCalls] }), _jsxs("span", { className: styles.stat, children: [t('stats.llm'), ": ", data.stats.llmStreams] }), _jsxs("span", { className: data.stats.errorCount > 0 ? styles.statError : styles.stat, children: [t('stats.errors'), ": ", data.stats.errorCount] }), data.stats.droppedCount > 0 && (_jsxs("span", { className: styles.stat, children: [t('stats.dropped'), ": ", data.stats.droppedCount] })), _jsx("button", { className: `${styles.autoToggle} ${auto ? styles.autoOn : ''}`, type: "button", onClick: () => setAuto((v) => !v), children: t('auto') }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), children: t('refresh') })] }), _jsxs("div", { className: styles.filters, children: [_jsxs("label", { className: styles.filterLabel, children: [t('filter.kind'), _jsxs("select", { className: styles.filterSelect, value: kindFilter, onChange: (e) => setKindFilter(e.target.value), children: [_jsx("option", { value: "all", children: t('filter.all') }), _jsx("option", { value: "tool.call", children: t('kind.tool') }), _jsx("option", { value: "llm.stream", children: t('kind.llm') })] })] }), _jsxs("label", { className: styles.filterLabel, children: [t('filter.outcome'), _jsxs("select", { className: styles.filterSelect, value: outcomeFilter, onChange: (e) => setOutcomeFilter(e.target.value), children: [_jsx("option", { value: "all", children: t('filter.all') }), _jsx("option", { value: "success", children: t('outcome.success') }), _jsx("option", { value: "error", children: t('outcome.error') }), _jsx("option", { value: "cancelled", children: t('outcome.cancelled') })] })] }), kindFilter !== 'all' || outcomeFilter !== 'all' ? (_jsx("button", { className: styles.clearFilter, type: "button", onClick: () => { setKindFilter('all'); setOutcomeFilter('all'); }, children: t('filter.clear') })) : null] }), _jsxs("div", { className: styles.panel, children: [_jsxs("div", { className: styles.panelTitle, children: [t('panel.title'), _jsxs("span", { className: styles.panelRate, children: [t('panel.errorRate'), ": ", (data.stats.errorRate * 100).toFixed(1), "%"] })] }), _jsxs("div", { className: styles.panelGrid, children: [_jsxs("div", { className: styles.panelCol, children: [_jsx("div", { className: styles.panelColTitle, children: t('panel.topTools') }), data.stats.topTools.length === 0 && _jsx("div", { className: styles.panelEmpty, children: t('panel.empty') }), data.stats.topTools.map((tool) => (_jsxs("div", { className: styles.panelRow, title: tool.name, children: [_jsx("span", { className: styles.panelName, children: tool.name }), _jsxs("span", { className: styles.panelStat, children: [tool.calls, "\u00D7"] }), _jsxs("span", { className: `${styles.panelStat} ${tool.errors > 0 ? styles.panelErr : ''}`, children: [t('panel.errors'), ": ", tool.errors] }), _jsx("span", { className: styles.panelBarWrap, children: _jsx("span", { className: tool.errorRate > 0 ? styles.panelBarErr : styles.panelBar, style: { width: `${Math.min(tool.errorRate * 100, 100)}%` } }) })] }, tool.name)))] }), _jsxs("div", { className: styles.panelCol, children: [_jsx("div", { className: styles.panelColTitle, children: t('panel.topModels') }), data.stats.topModels.length === 0 && _jsx("div", { className: styles.panelEmpty, children: t('panel.empty') }), data.stats.topModels.map((model) => (_jsxs("div", { className: styles.panelRow, title: model.name, children: [_jsx("span", { className: styles.panelName, children: model.name }), _jsxs("span", { className: styles.panelStat, children: [model.streams, "\u00D7"] }), _jsx("span", { className: styles.panelStat, children: formatDuration(model.avgDurationMs) }), _jsxs("span", { className: styles.panelStat, children: [t('panel.chunks'), ": ", model.totalChunks] })] }, model.name)))] })] })] }), _jsxs("div", { className: styles.timeline, children: [groups.length === 0 && _jsx("div", { className: styles.row, children: _jsx("span", { className: styles.empty, children: t('empty') }) }), groups.map((group) => (_jsxs("div", { className: styles.group, children: [_jsxs("div", { className: styles.groupTitle, children: [group.kind === 'llm.stream' ? t('group.llm') : t('group.tool'), _jsx("span", { className: styles.groupCount, children: group.events.length })] }), group.events.map((event) => (_jsxs("div", { className: `${styles.row} ${event.outcome === 'error' ? styles.rowError : ''}`, children: [_jsx("span", { className: `${styles.dot} ${dotClass(event.outcome)}` }), _jsx("span", { className: `${styles.kind} ${event.kind === 'llm.stream' ? styles.kindLlm : ''}`, children: event.kind === 'llm.stream' ? t('kind.llm') : t('kind.tool') }), _jsx("span", { className: styles.name, title: event.name, children: event.name }), event.agent && _jsx("span", { className: styles.agent, children: event.agent }), event.source === 'mcp' && _jsx("span", { className: styles.mcp, children: t('source.mcp') }), _jsx("span", { className: styles.duration, children: formatDuration(event.durationMs) }), _jsx("span", { className: styles.time, children: formatTime(event.startedAt) })] }, event.id)))] }, group.kind)))] })] }));
}
//# sourceMappingURL=ObserveTab.js.map