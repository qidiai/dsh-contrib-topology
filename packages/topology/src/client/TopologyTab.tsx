/**
 * Topology settings tab — dependency-free SVG graph of the live plugin tree.
 *
 * Layout: plugins in the left column (contains-edges indent children under
 * parents), service hubs in the right column, injects-edges as bezier curves.
 * Hover a node to highlight its connected edges; click to pin selection.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TopologyEdge, TopologyPluginNode, TopologySnapshot } from '../types.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './TopologyTab.module.css'

export interface TopologyTabInjected {
  /** Fetch a fresh snapshot from the host topology Remote. */
  graph(): Promise<TopologySnapshot>
}

/** Full component props assembled by the Settings slot renderer. */
export type TopologyTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginTopology'>
  & InjectFace<TopologyTabInjected>

const ROW_H = 28
const PAD_TOP = 16
const COL_PLUGIN_X = 20
const COL_SERVICE_X = 420
/** Runtime column: live subagent delegations and MCP servers. */
const COL_RUNTIME_X = 640
const WIDTH = 920

/** Plugin column partitions, in render order. */
const GROUP_ORDER = ['core', 'contrib', 'third-party'] as const
const GROUP_LABEL: Record<string, string> = {
  core: 'core',
  contrib: 'contrib',
  'third-party': 'third-party',
}

interface Point { x: number; y: number }

function phaseClass(phase: string | null): string | undefined {
  if (phase === 'active') return styles.nodeActive
  if (phase === 'failed') return styles.nodeFailed
  if (phase === 'loading' || phase === 'pending') return styles.nodePending
  return styles.nodeIdle
}

/** Render the live plugin/service dependency topology. */
export function TopologyTab({ graph, t }: TopologyTabProps): ReactNode {
  const [snapshot, setSnapshot] = useState<TopologySnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<string | null>(null)

  const refresh = useCallback(async () => {
    try {
      setSnapshot(await graph())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [graph])

  useEffect(() => { void refresh() }, [refresh])

  /** Plugin rows ordered so children sit directly under their parents. */
  const pluginOrder = useMemo(() => {
    if (!snapshot) return []
    const plugins = snapshot.nodes.flatMap((n) => (n.kind === 'plugin' ? [n.plugin] : []))
    const byParent = new Map<string | undefined, typeof plugins>()
    for (const p of plugins) {
      const list = byParent.get(p.parentId) ?? []
      list.push(p)
      byParent.set(p.parentId, list)
    }
    const ordered: { plugin: (typeof plugins)[number]; depth: number }[] = []
    const walk = (parentId: string | undefined, depth: number): void => {
      for (const p of byParent.get(parentId) ?? []) {
        ordered.push({ plugin: p, depth })
        walk(p.id, depth + 1)
      }
    }
    walk(undefined, 0)
    // Orphans whose parentId didn't resolve still get listed.
    for (const p of plugins) {
      if (!ordered.some((o) => o.plugin.id === p.id)) ordered.push({ plugin: p, depth: 0 })
    }
    // Partition by group (core → contrib → third-party), stable within group.
    const groupRank = new Map(GROUP_ORDER.map((g, i) => [g, i]))
    return [...ordered].sort((a, b) =>
      (groupRank.get(a.plugin.group) ?? 99) - (groupRank.get(b.plugin.group) ?? 99))
  }, [snapshot])

  /** Plugin rows with one group header per partition (core/contrib/third-party). */
  const pluginRows = useMemo(() => {
    const rows: ({ kind: 'header'; group: string } | { kind: 'plugin'; plugin: TopologyPluginNode; depth: number })[] = []
    let lastGroup: string | null = null
    for (const { plugin, depth } of pluginOrder) {
      if (plugin.group !== lastGroup) {
        rows.push({ kind: 'header', group: plugin.group })
        lastGroup = plugin.group
      }
      rows.push({ kind: 'plugin', plugin, depth })
    }
    return rows
  }, [pluginOrder])

  const positions = useMemo(() => {
    const map = new Map<string, Point>()
    // Header rows occupy one row each so partitions stay visually distinct.
    let rowIndex = 0
    for (const row of pluginRows) {
      if (row.kind === 'plugin') {
        map.set(row.plugin.id, { x: COL_PLUGIN_X + row.depth * 18, y: PAD_TOP + rowIndex * ROW_H })
      }
      rowIndex += 1
    }
    if (snapshot) {
      const services = snapshot.nodes.flatMap((n) => (n.kind === 'service' ? [n.service] : []))
      services.forEach((s, i) => {
        map.set(s.id, { x: COL_SERVICE_X, y: PAD_TOP + i * ROW_H })
      })
      const runtime = snapshot.nodes.flatMap((n) => {
        if (n.kind === 'subagent') return [{ id: n.subagent.id, label: n.subagent.provider }]
        if (n.kind === 'mcp') return [{ id: n.mcp.id, label: n.mcp.serverName }]
        return []
      })
      runtime.forEach((r, i) => {
        map.set(r.id, { x: COL_RUNTIME_X, y: PAD_TOP + i * ROW_H })
      })
    }
    return map
  }, [pluginRows, snapshot])

  /** enabled lookup for dashed disabled injects edges. */
  const enabledById = useMemo(() => {
    const map = new Map<string, boolean>()
    for (const n of snapshot?.nodes ?? []) {
      if (n.kind === 'plugin') map.set(n.plugin.id, n.plugin.enabled)
    }
    return map
  }, [snapshot])

  const focus = hovered ?? selected
  const isEdgeLit = useCallback((edge: TopologyEdge): boolean => {
    if (!focus) return false
    return edge.from === focus || edge.to === focus
  }, [focus])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }
  if (!snapshot) {
    return <div className={styles.root}><div className={styles.empty}>{t('empty')}</div></div>
  }

  const pluginCount = snapshot.nodes.filter((n) => n.kind === 'plugin').length
  const serviceCount = snapshot.nodes.filter((n) => n.kind === 'service').length
  const subagentCount = snapshot.nodes.filter((n) => n.kind === 'subagent').length
  const mcpCount = snapshot.nodes.filter((n) => n.kind === 'mcp').length
  const height = PAD_TOP * 2 + Math.max(pluginRows.length, serviceCount, subagentCount + mcpCount) * ROW_H

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.plugins')}: {pluginCount}</span>
        <span className={styles.stat}>{t('stats.services')}: {serviceCount}</span>
        <span className={styles.stat}>{t('stats.subagents')}: {subagentCount}</span>
        <span className={styles.stat}>{t('stats.mcp')}: {mcpCount}</span>
        <span className={styles.stat}>{t('stats.edges')}: {snapshot.edges.length}</span>
        <button className={styles.refresh} type="button" onClick={() => void refresh()}>{t('refresh')}</button>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${height}`} className={styles.canvas}>
        {snapshot.edges.map((edge, i) => {
          const a = positions.get(edge.from)
          const b = positions.get(edge.to)
          if (!a || !b) return null
          const x1 = a.x + 180
          const y1 = a.y + ROW_H / 2
          const x2 = b.x
          const y2 = b.y + ROW_H / 2
          const mx = (x1 + x2) / 2
          const lit = isEdgeLit(edge)
          // A disabled plugin still declares injects; render them dashed.
          const disabledInjects = edge.kind === 'injects' && enabledById.get(edge.from) === false
          const edgeKindClass = edge.kind === 'contains' ? styles.edgeContains
            : edge.kind === 'dispatch' ? styles.edgeDispatch
            : edge.kind === 'provides-mcp' ? styles.edgeMcp
            : ''
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              className={`${styles.edge} ${edgeKindClass} ${disabledInjects ? styles.edgeDisabled : ''} ${lit ? styles.edgeLit : ''} ${focus && !lit ? styles.edgeDim : ''}`}
            />
          )
        })}
        {pluginRows.map((row, i) => {
          if (row.kind === 'header') {
            return (
              <text
                key={`group:${row.group}`}
                x={COL_PLUGIN_X}
                y={PAD_TOP + i * ROW_H + ROW_H / 2 + 3}
                className={styles.groupHeader}
              >
                {GROUP_LABEL[row.group] ?? row.group}
              </text>
            )
          }
          const { plugin, depth } = row
          const pos = positions.get(plugin.id)
          if (!pos) return null
          return (
            <g
              key={plugin.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`${styles.node} ${focus === plugin.id ? styles.nodeFocus : ''}`}
              onMouseEnter={() => setHovered(plugin.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((cur) => (cur === plugin.id ? null : plugin.id))}
            >
              <rect width={180} height={ROW_H - 4} rx={5} className={phaseClass(plugin.fiberPhase)} />
              <text x={8} y={ROW_H / 2 + 3} className={styles.label}>
                {plugin.name.length > 26 ? `${plugin.name.slice(0, 24)}…` : plugin.name}
              </text>
              {depth > 0 && (
                <text x={-12} y={ROW_H / 2 + 3} className={styles.depth} textAnchor="end">⊢</text>
              )}
            </g>
          )
        })}
        {snapshot.nodes.filter((n) => n.kind === 'service').map((node) => {
          if (node.kind !== 'service') return null
          const pos = positions.get(node.service.id)
          if (!pos) return null
          return (
            <g
              key={node.service.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`${styles.node} ${focus === node.service.id ? styles.nodeFocus : ''}`}
              onMouseEnter={() => setHovered(node.service.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((cur) => (cur === node.service.id ? null : node.service.id))}
            >
              <rect width={220} height={ROW_H - 4} rx={5} className={styles.nodeService} />
              <text x={8} y={ROW_H / 2 + 3} className={styles.label}>
                {node.service.name.length > 26 ? `${node.service.name.slice(0, 24)}…` : node.service.name}
              </text>
              <text x={212} y={ROW_H / 2 + 3} className={styles.badge} textAnchor="end">
                {node.service.consumerCount}
              </text>
            </g>
          )
        })}
        {snapshot.nodes.filter((n) => n.kind === 'subagent').map((node) => {
          if (node.kind !== 'subagent') return null
          const pos = positions.get(node.subagent.id)
          if (!pos) return null
          const outcomeClass = node.subagent.outcome === 'success' ? styles.nodeSubagentOk
            : node.subagent.outcome === 'error' ? styles.nodeSubagentErr
            : styles.nodeSubagentRun
          return (
            <g
              key={node.subagent.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`${styles.node} ${focus === node.subagent.id ? styles.nodeFocus : ''}`}
              onMouseEnter={() => setHovered(node.subagent.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((cur) => (cur === node.subagent.id ? null : node.subagent.id))}
            >
              <rect width={220} height={ROW_H - 4} rx={5} className={outcomeClass} />
              <text x={8} y={ROW_H / 2 + 3} className={styles.label}>
                {node.subagent.provider.length > 26 ? `${node.subagent.provider.slice(0, 24)}…` : node.subagent.provider}
              </text>
              <text x={212} y={ROW_H / 2 + 3} className={styles.badge} textAnchor="end">
                {node.subagent.outcome === 'running' ? '…' : `${node.subagent.durationMs ?? 0}ms`}
              </text>
            </g>
          )
        })}
        {snapshot.nodes.filter((n) => n.kind === 'mcp').map((node) => {
          if (node.kind !== 'mcp') return null
          const pos = positions.get(node.mcp.id)
          if (!pos) return null
          return (
            <g
              key={node.mcp.id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`${styles.node} ${focus === node.mcp.id ? styles.nodeFocus : ''}`}
              onMouseEnter={() => setHovered(node.mcp.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((cur) => (cur === node.mcp.id ? null : node.mcp.id))}
            >
              <rect width={220} height={ROW_H - 4} rx={5} className={styles.nodeMcp} />
              <text x={8} y={ROW_H / 2 + 3} className={styles.label}>
                {node.mcp.serverName.length > 22 ? `${node.mcp.serverName.slice(0, 20)}…` : node.mcp.serverName}
              </text>
              <text x={212} y={ROW_H / 2 + 3} className={styles.badge} textAnchor="end">
                {node.mcp.toolCount}↴
              </text>
            </g>
          )
        })}
      </svg>
      <div className={styles.legend}>
        <span>{t('legend.plugin')}: ■</span>
        <span>{t('legend.service')}: ■</span>
        <span>{t('legend.active')}: ■</span>
        <span>{t('legend.failed')}: ■</span>
      </div>
    </div>
  )
}
