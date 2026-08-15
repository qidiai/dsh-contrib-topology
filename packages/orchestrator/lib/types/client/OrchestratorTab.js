import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Orchestrator settings tab — five-mode multi-agent dispatch.
 *
 * Shows aggregate dispatch counters and recent history, and lets you run a
 * dispatch on demand: task text + optional candidate providers + mode.
 */
import { useCallback, useEffect, useState } from 'react';
import styles from './OrchestratorTab.module.css';
const MODES = ['parallel', 'sequential', 'select', 'cascade', 'merge'];
/** Locale keys indexed by mode (safe for the strongly-typed `t`). */
const MODE_KEYS = {
    parallel: 'mode.parallel',
    sequential: 'mode.sequential',
    select: 'mode.select',
    cascade: 'mode.cascade',
    merge: 'mode.merge',
};
function fmtDuration(ms) {
    if (ms < 1_000)
        return `${ms}ms`;
    return `${(ms / 1_000).toFixed(1)}s`;
}
/** Render the live orchestration counters, dispatch box, and history. */
export function OrchestratorTab({ snapshot, dispatch, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [task, setTask] = useState('');
    const [agents, setAgents] = useState('');
    const [mode, setMode] = useState('parallel');
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
    const runDispatch = useCallback(async () => {
        if (!task.trim() || busy)
            return;
        setBusy(true);
        setError(null);
        try {
            const parsed = agents.split(',').map((s) => s.trim()).filter(Boolean);
            await dispatch(task, parsed, mode);
            setTask('');
            await refresh();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
        finally {
            setBusy(false);
        }
    }, [task, agents, mode, busy, dispatch, refresh]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    const stats = data?.stats;
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsxs("span", { className: styles.stat, children: [t('stats.dispatches'), ": ", stats?.dispatches ?? 0] }), _jsxs("span", { className: styles.stat, children: [t('stats.runs'), ": ", stats?.runs ?? 0] }), _jsxs("span", { className: styles.stat, children: [t('stats.successes'), ": ", stats?.successes ?? 0] }), _jsxs("span", { className: styles.stat, children: [t('stats.failures'), ": ", stats?.failures ?? 0] }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), children: t('refresh') })] }), _jsxs("div", { className: styles.dispatchBox, children: [_jsx("input", { className: styles.taskInput, placeholder: t('field.task'), value: task, onChange: (e) => setTask(e.target.value) }), _jsx("input", { className: styles.taskInput, placeholder: t('field.agents'), value: agents, onChange: (e) => setAgents(e.target.value) }), _jsx("select", { className: styles.modeSelect, value: mode, onChange: (e) => setMode(e.target.value), children: MODES.map((m) => _jsx("option", { value: m, children: t(MODE_KEYS[m]) }, m)) }), _jsx("button", { className: styles.dispatchBtn, type: "button", onClick: () => void runDispatch(), disabled: !task.trim() || busy, children: busy ? '…' : t('btn.dispatch') })] }), _jsxs("div", { className: styles.history, children: [_jsx("div", { className: styles.historyTitle, children: t('history.title') }), (data?.history.length ?? 0) === 0 && _jsx("div", { className: styles.empty, children: t('empty') }), data?.history.map((entry, i) => (_jsxs("div", { className: styles.historyRow, children: [_jsx("span", { className: styles.historyMode, children: t(MODE_KEYS[entry.mode]) }), _jsx("span", { className: styles.historyTask, title: entry.task, children: entry.task }), entry.winner && _jsxs("span", { className: styles.historyWinner, children: [t('history.winner'), ": ", entry.winner] }), _jsx("span", { className: `${styles.historyOk} ${entry.allOk ? styles.ok : styles.fail}`, children: entry.allOk ? t('run.ok') : t('run.fail') }), _jsx("span", { className: styles.historyDuration, children: fmtDuration(entry.durationMs) })] }, `${entry.startedAt}-${i}`)))] })] }));
}
//# sourceMappingURL=OrchestratorTab.js.map