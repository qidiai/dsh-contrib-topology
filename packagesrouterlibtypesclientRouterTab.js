import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Router settings tab — explainable subagent-provider routing.
 *
 * Shows the observed provider profiles (calls/success/confidence/freshness)
 * and lets you score/rank providers for a task description, with per-dimension
 * components and a plain-language reason for each candidate.
 */
import { useCallback, useEffect, useState } from 'react';
import styles from './RouterTab.module.css';
function fmtDuration(ms) {
    if (ms === null)
        return '—';
    if (ms < 1_000)
        return `${ms}ms`;
    return `${(ms / 1_000).toFixed(1)}s`;
}
function fmtRate(value) {
    return `${(value * 100).toFixed(0)}%`;
}
/** Render the live provider routing profiles and task ranking. */
export function RouterTab({ profiles, rank, t }) {
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);
    const [task, setTask] = useState('');
    const [candidates, setCandidates] = useState('');
    const [ranking, setRanking] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setData(await profiles());
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [profiles]);
    useEffect(() => { void refresh(); }, [refresh]);
    const runRank = useCallback(async () => {
        if (!task.trim())
            return;
        setError(null);
        try {
            const parsed = candidates.split(',').map((s) => s.trim()).filter(Boolean);
            setRanking(await rank(task, parsed.length > 0 ? parsed : undefined));
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [task, candidates, rank]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    const providers = data?.providers ?? [];
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsxs("span", { className: styles.stat, children: [t('stats.providers'), ": ", providers.length] }), _jsxs("span", { className: styles.stat, children: [t('stats.calls'), ": ", providers.reduce((a, p) => a + p.calls, 0)] }), _jsxs("span", { className: styles.stat, children: [t('stats.successes'), ": ", providers.reduce((a, p) => a + p.successes, 0)] }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), children: t('refresh') })] }), _jsxs("div", { className: styles.rankBox, children: [_jsx("input", { className: styles.taskInput, placeholder: t('field.task'), value: task, onChange: (e) => setTask(e.target.value) }), _jsx("input", { className: styles.taskInput, placeholder: t('field.candidates'), value: candidates, onChange: (e) => setCandidates(e.target.value) }), _jsx("button", { className: styles.rankBtn, type: "button", onClick: () => void runRank(), disabled: !task.trim(), children: t('btn.rank') })] }), ranking && (_jsxs("div", { className: styles.ranking, children: [_jsxs("div", { className: styles.rankTitle, children: [t('rank.title'), " \u00B7 ", t('rank.category'), ": ", ranking.category] }), ranking.ranked.map((entry, i) => (_jsxs("div", { className: styles.rankRow, children: [_jsx("span", { className: styles.rankPos, children: i + 1 }), _jsx("span", { className: styles.rankName, children: entry.name }), _jsxs("span", { className: styles.rankScore, children: [t('rank.score'), ": ", entry.score.toFixed(3)] }), entry.profile.coolingDown && _jsx("span", { className: styles.cooling, children: t('rank.cooling') }), _jsx("span", { className: styles.rankReason, title: entry.reason, children: entry.reason })] }, entry.name)))] })), _jsxs("div", { className: styles.profiles, children: [providers.length === 0 && _jsx("div", { className: styles.empty, children: t('empty') }), providers.map((p) => (_jsxs("div", { className: styles.profileRow, children: [_jsx("span", { className: styles.profileName, children: p.name }), _jsxs("span", { className: styles.profileStat, children: [t('profile.success'), ": ", fmtRate(p.successScore)] }), _jsxs("span", { className: styles.profileStat, children: [t('profile.confidence'), ": ", fmtRate(p.confidence)] }), _jsxs("span", { className: styles.profileStat, children: [t('profile.freshness'), ": ", fmtRate(p.freshness)] }), _jsxs("span", { className: styles.profileStat, children: [t('profile.stability'), ": ", fmtRate(p.stabilityScore)] }), _jsxs("span", { className: styles.profileStat, children: [t('profile.latency'), ": ", fmtDuration(p.averageDurationMs)] }), _jsxs("span", { className: styles.profileStat, children: [t('profile.tokens'), ": ", p.averageTokens === null ? '—' : Math.round(p.averageTokens)] }), p.coolingDown && _jsx("span", { className: styles.cooling, children: t('rank.cooling') })] }, p.name)))] })] }));
}
//# sourceMappingURL=RouterTab.js.map