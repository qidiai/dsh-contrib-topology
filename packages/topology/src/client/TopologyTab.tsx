/**
 * Topology settings tab — dependency-free SVG graph of the live plugin tree.
 *
 * Layout: plugins in the left column (contains-edges indent children under
 * parents), service hubs in the right column, injects-edges as bezier curves.
 * Hover a node to highlight its connected edges; click to pin selection.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { TopologyEdge, TopologySnapshot } from '../types.ts'
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
const WIDTH = 680

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
    return ordered
  }, [snapshot])

  const positions = useMemo(() => {
    const map = new Map<string, Point>()
    pluginOrder.forEach(({ plugin, depth }, i) => {
      map.set(plugin.id, { x: COL_PLUGIN_X + depth * 18, y: PAD_TOP + i * ROW_H })
    })
    if (snapshot) {
      const services = snapshot.nodes.flatMap((n) => (n.kind === 'service' ? [n.service] : []))
      services.forEach((s, i) => {
        map.set(s.id, { x: COL_SERVICE_X, y: PAD_TOP + i * ROW_H })
      })
    }
    return map
  }, [pluginOrder, snapshot])

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

  const height = PAD_TOP * 2 + Math.max(pluginOrder.length, 1) * ROW_H
  const pluginCount = snapshot.nodes.filter((n) => n.kind === 'plugin').length
  const serviceCount = snapshot.nodes.filter((n) => n.kind === 'service').length

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.plugins')}: {pluginCount}</span>
        <span className={styles.stat}>{t('stats.services')}: {serviceCount}</span>
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
          return (
            <path
              key={i}
              d={`M ${x1} ${y1} C ${mx} ${y1}, ${mx} ${y2}, ${x2} ${y2}`}
              className={`${styles.edge} ${edge.kind === 'contains' ? styles.edgeContains : ''} ${lit ? styles.edgeLit : ''} ${focus && !lit ? styles.edgeDim : ''}`}
            />
          )
        })}
        {snapshot.nodes.map((node) => {
          const id = node.kind === 'plugin' ? node.plugin.id : node.service.id
          const pos = positions.get(id)
          if (!pos) return null
          const isPlugin = node.kind === 'plugin'
          const label = isPlugin ? node.plugin.name : node.service.name
          const cls = isPlugin
            ? phaseClass(node.plugin.fiberPhase)
            : styles.nodeService
          return (
            <g
              key={id}
              transform={`translate(${pos.x}, ${pos.y})`}
              className={`${styles.node} ${focus === id ? styles.nodeFocus : ''}`}
              onMouseEnter={() => setHovered(id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => setSelected((cur) => (cur === id ? null : id))}
            >
              <rect width={isPlugin ? 180 : 220} height={ROW_H - 4} rx={5} className={cls} />
              <text x={8} y={ROW_H / 2 + 3} className={styles.label}>
                {label.length > 26 ? `${label.slice(0, 24)}…` : label}
              </text>
              {!isPlugin && (
                <text x={212} y={ROW_H / 2 + 3} className={styles.badge} textAnchor="end">
                  {node.service.consumerCount}
                </text>
              )}
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
