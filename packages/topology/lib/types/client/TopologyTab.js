import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * Topology settings tab — dependency-free SVG graph of the live plugin tree.
 *
 * Layout: plugins in the left column (contains-edges indent children under
 * parents), service hubs in the right column, injects-edges as bezier curves.
 * Hover a node to highlight its connected edges; click to pin selection.
 */
import { useCallback, useEffect, useMemo, useState } from 'react';
import styles from './TopologyTab.module.css';
const ROW_H = 28;
const PAD_TOP = 16;
const COL_PLUGIN_X = 20;
const COL_SERVICE_X = 420;
/** Runtime column: live subagent delegations and MCP servers. */
const COL_RUNTIME_X = 640;
const WIDTH = 920;
/** Plugin column partitions, in render order. */
const GROUP_ORDER = ['core', 'contrib', 'third-party'];
const GROUP_LABEL = {
    core: 'core',
    contrib: 'contrib',
    'third-party': 'third-party',
};
function phaseClass(phase) {
    if (phase === 'active')
        return styles.nodeActive;
    if (phase === 'failed')
        return styles.nodeFailed;
    if (phase === 'loading' || phase === 'pending')
        return styles.nodePending;
    return styles.nodeIdle;
}
/** Render the live plugin/service dependency topology. */
export function TopologyTab({ graph, t }) {
    const [snapshot, setSnapshot] = useState(null);
    const [error, setError] = useState(null);
    const [selected, setSelected] = useState(null);
    const [hovered, setHovered] = useState(null);
    const refresh = useCallback(async () => {
        try {
            setSnapshot(await graph());
            setError(null);
        }
        catch (e) {
            setError(e instanceof Error ? e.message : String(e));
        }
    }, [graph]);
    useEffect(() => { void refresh(); }, [refresh]);
    /** Plugin rows ordered so children sit directly under their parents. */
    const pluginOrder = useMemo(() => {
        if (!snapshot)
            return [];
        const plugins = snapshot.nodes.flatMap((n) => (n.kind === 'plugin' ? [n.plugin] : []));
        const byParent = new Map();
        for (const p of plugins) {
            const list = byParent.get(p.parentId) ?? [];
            list.push(p);
            byParent.set(p.parentId, list);
        }
        const ordered = [];
        const walk = (parentId, depth) => {
            for (const p of byParent.get(parentId) ?? []) {
                ordered.push({ plugin: p, depth });
                walk(p.id, depth + 1);
            }
        };
        walk(undefined, 0);
        // Orphans whose parentId didn't resolve still get listed.
        for (const p of plugins) {
            if (!ordered.some((o) => o.plugin.id === p.id))
                ordered.push({ plugin: p, depth: 0 });
        }
        // Partition by group (core → contrib → third-party), stable within group.
        const groupRank = new Map(GROUP_ORDER.map((g, i) => [g, i]));
        return [...ordered].sort((a, b) => (groupRank.get(a.plugin.group) ?? 99) - (groupRank.get(b.plugin.group) ?? 99));
    }, [snapshot]);
    /** Plugin rows with one group header per partition (core/contrib/third-party). */
    const pluginRows = useMemo(() => {
        const rows = [];
        let lastGroup = null;
        for (const { plugin, depth } of pluginOrder) {
            if (plugin.group !== lastGroup) {
                rows.push({ kind: 'header', group: plugin.group });
                lastGroup = plugin.group;
            }
            rows.push({ kind: 'plugin', plugin, depth });
        }
        return rows;
    }, [pluginOrder]);
    const positions = useMemo(() => {
        const map = new Map();
        // Header rows occupy one row each so partitions stay visually distinct.
        let rowIndex = 0;
        for (const row of pluginRows) {
            if (row.kind === 'plugin') {
                map.set(row.plugin.id, { x: COL_PLUGIN_X + row.depth * 18, y: PAD_TOP + rowIndex * ROW_H });
            }
            rowIndex += 1;
        }
        if (snapshot) {
            const services = snapshot.nodes.flatMap((n) => (n.kind === 'service' ? [n.service] : []));
            services.forEach((s, i) => {
                map.set(s.id, { x: COL_SERVICE_X, y: PAD_TOP + i * ROW_H });
            });
            const runtime = snapshot.nodes.flatMap((n) => {
                if (n.kind === 'subagent')
                    return [{ id: n.subagent.id, label: n.subagent.provider }];
                if (n.kind === 'mcp')
                    return [{ id: n.mcp.id, label: n.mcp.serverName }];
                return [];
            });
            runtime.forEach((r, i) => {
                map.set(r.id, { x: COL_RUNTIME_X, y: PAD_TOP + i * ROW_H });
            });
        }
        return map;
    }, [pluginRows, snapshot]);
    /** enabled lookup for dashed disabled injects edges. */
    const enabledById = useMemo(() => {
        const map = new Map();
        for (const n of snapshot?.nodes ?? []) {
            if (n.kind === 'plugin')
                map.set(n.plugin.id, n.plugin.enabled);
        }
        return map;
    }, [snapshot]);
    const focus = hovered ?? selected;
    const isEdgeLit = useCallback((edge) => {
        if (!focus)
            return false;
        return edge.from === focus || edge.to === focus;
    }, [focus]);
    if (error) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.error, children: error }) });
    }
    if (!snapshot) {
        return _jsx("div", { className: styles.root, children: _jsx("div", { className: styles.empty, children: t('empty') }) });
    }
    const pluginCount = snapshot.nodes.filter((n) => n.kind === 'plugin').length;
    const serviceCount = snapshot.nodes.filter((n) => n.kind === 'service').length;
    const subagentCount = snapshot.nodes.filter((n) => n.kind === 'subagent').length;
    const mcpCount = snapshot.nodes.filter((n) => n.kind === 'mcp').length;
    const height = PAD_TOP * 2 + Math.max(pluginRows.length, serviceCount, subagentCount + mcpCount) * ROW_H;
    return (_jsxs("div", { className: styles.root, children: [_jsxs("div", { className: styles.header, children: [_jsx("span", { className: styles.title, children: t('title') }), _jsxs("span", { className: styles.stat, children: [t('stats.plugins'), ": ", pluginCount] }), _jsxs("span", { className: styles.stat, children: [t('stats.services'), ": ", serviceCount] }), _jsxs("span", { className: styles.stat, children: [t('stats.subagents'), ": ", subagentCount] }), _jsxs("span", { className: styles.stat, children: [t('stats.mcp'), ": ", mcpCount] }), _jsxs("span", { className: styles.stat, children: [t('stats.edges'), ": ", snapshot.edges.length] }), _jsx("button", { className: styles.refresh, type: "button", onClick: () => void refresh(), children: t('refresh') })] }), _jsxs("svg", { viewBox: `0 0 ${WIDTH} ${height}`, className: styles.canvas, children: [snapshot.edges.map((edge, i) => {
                        const a = positions.get(edge.from);
                        const b = positions.get(edge.to);
                        if (!a || !b)
                            return null;
                        const x1 = a.x + 180;
                        const y1 = a.y + ROW_H / 2;
                        const x2 = b.x;
                        const y2 = b.y + ROW_H / 2;
                        const mx = (x1 + x2) / 2;
                        const lit = isEdgeLit(edge);
                        // A disabled plugin still declares injects; render them dashed.
                        const disabledInjects = edge.kind === 'injects' && enabledById.get(edge.from) === false;
                        const edgeKindClass = edge.kind === 'contains' ? styles.edgeContains
                            : edge.kind === 'dispatch' ? styles.edgeDispatch
                                : edge.kind === 'provides-mcp' ? styles.edgeMcp
                                    : '';
                        return (_jsx("path", { d: `M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`, className: `${styles.edge} ${edgeKindClass} ${disabledInjects ? styles.edgeDisabled : ''} ${lit ? styles.edgeLit : ''} ${focus && !lit ? styles.edgeDim : ''}` }, i));
                    }), pluginRows.map((row, i) => {
                        if (row.kind === 'header') {
                            return (_jsx("text", { x: COL_PLUGIN_X, y: PAD_TOP + i * ROW_H + ROW_H / 2 + 3, className: styles.groupHeader, children: GROUP_LABEL[row.group] ?? row.group }, `group:${row.group}`));
                        }
                        const { plugin, depth } = row;
                        const pos = positions.get(plugin.id);
                        if (!pos)
                            return null;
                        return (_jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, className: `${styles.node} ${focus === plugin.id ? styles.nodeFocus : ''}`, onMouseEnter: () => setHovered(plugin.id), onMouseLeave: () => setHovered(null), onClick: () => setSelected((cur) => (cur === plugin.id ? null : plugin.id)), children: [_jsx("rect", { width: 180, height: ROW_H - 4, rx: 5, className: phaseClass(plugin.fiberPhase) }), _jsx("text", { x: 8, y: ROW_H / 2 + 3, className: styles.label, children: plugin.name.length > 26 ? `${plugin.name.slice(0, 24)}…` : plugin.name }), depth > 0 && (_jsx("text", { x: -12, y: ROW_H / 2 + 3, className: styles.depth, textAnchor: "end", children: "\u22A2" }))] }, plugin.id));
                    }), snapshot.nodes.filter((n) => n.kind === 'service').map((node) => {
                        if (node.kind !== 'service')
                            return null;
                        const pos = positions.get(node.service.id);
                        if (!pos)
                            return null;
                        return (_jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, className: `${styles.node} ${focus === node.service.id ? styles.nodeFocus : ''}`, onMouseEnter: () => setHovered(node.service.id), onMouseLeave: () => setHovered(null), onClick: () => setSelected((cur) => (cur === node.service.id ? null : node.service.id)), children: [_jsx("rect", { width: 220, height: ROW_H - 4, rx: 5, className: styles.nodeService }), _jsx("text", { x: 8, y: ROW_H / 2 + 3, className: styles.label, children: node.service.name.length > 26 ? `${node.service.name.slice(0, 24)}…` : node.service.name }), _jsx("text", { x: 212, y: ROW_H / 2 + 3, className: styles.badge, textAnchor: "end", children: node.service.consumerCount })] }, node.service.id));
                    }), snapshot.nodes.filter((n) => n.kind === 'subagent').map((node) => {
                        if (node.kind !== 'subagent')
                            return null;
                        const pos = positions.get(node.subagent.id);
                        if (!pos)
                            return null;
                        const outcomeClass = node.subagent.outcome === 'success' ? styles.nodeSubagentOk
                            : node.subagent.outcome === 'error' ? styles.nodeSubagentErr
                                : styles.nodeSubagentRun;
                        return (_jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, className: `${styles.node} ${focus === node.subagent.id ? styles.nodeFocus : ''}`, onMouseEnter: () => setHovered(node.subagent.id), onMouseLeave: () => setHovered(null), onClick: () => setSelected((cur) => (cur === node.subagent.id ? null : node.subagent.id)), children: [_jsx("rect", { width: 220, height: ROW_H - 4, rx: 5, className: outcomeClass }), _jsx("text", { x: 8, y: ROW_H / 2 + 3, className: styles.label, children: node.subagent.provider.length > 26 ? `${node.subagent.provider.slice(0, 24)}…` : node.subagent.provider }), _jsx("text", { x: 212, y: ROW_H / 2 + 3, className: styles.badge, textAnchor: "end", children: node.subagent.outcome === 'running' ? '…' : `${node.subagent.durationMs ?? 0}ms` })] }, node.subagent.id));
                    }), snapshot.nodes.filter((n) => n.kind === 'mcp').map((node) => {
                        if (node.kind !== 'mcp')
                            return null;
                        const pos = positions.get(node.mcp.id);
                        if (!pos)
                            return null;
                        return (_jsxs("g", { transform: `translate(${pos.x}, ${pos.y})`, className: `${styles.node} ${focus === node.mcp.id ? styles.nodeFocus : ''}`, onMouseEnter: () => setHovered(node.mcp.id), onMouseLeave: () => setHovered(null), onClick: () => setSelected((cur) => (cur === node.mcp.id ? null : node.mcp.id)), children: [_jsx("rect", { width: 220, height: ROW_H - 4, rx: 5, className: styles.nodeMcp }), _jsx("text", { x: 8, y: ROW_H / 2 + 3, className: styles.label, children: node.mcp.serverName.length > 22 ? `${node.mcp.serverName.slice(0, 20)}…` : node.mcp.serverName }), _jsxs("text", { x: 212, y: ROW_H / 2 + 3, className: styles.badge, textAnchor: "end", children: [node.mcp.toolCount, "\u21B4"] })] }, node.mcp.id));
                    })] }), _jsxs("div", { className: styles.legend, children: [_jsxs("span", { children: [t('legend.plugin'), ": \u25A0"] }), _jsxs("span", { children: [t('legend.service'), ": \u25A0"] }), _jsxs("span", { children: [t('legend.active'), ": \u25A0"] }), _jsxs("span", { children: [t('legend.failed'), ": \u25A0"] })] })] }));
}
//# sourceMappingURL=TopologyTab.js.map