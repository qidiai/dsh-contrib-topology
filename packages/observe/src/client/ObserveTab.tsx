/**
 * Observability settings tab — newest-first timeline of tool calls and LLM
 * streams captured by the host gateway. M2 adds kind/outcome filtering and
 * groups the timeline into tool-call and LLM-stream sections (M1 was a flat
 * list); M3 grows the stats header into a full panel.
 */

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { ObserveEvent, ObserveSnapshot } from '../types.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './ObserveTab.module.css'

export interface ObserveTabInjected {
  /** Fetch a fresh observation window from the host observe Remote. */
  snapshot(): Promise<ObserveSnapshot>
}

/** Full component props assembled by the Settings slot renderer. */
export type ObserveTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginObserve'>
  & InjectFace<ObserveTabInjected>

const AUTO_INTERVAL_MS = 3_000

/** Timeline filters: event kind and outcome. */
type KindFilter = 'all' | 'tool.call' | 'llm.stream'
type OutcomeFilter = 'all' | ObserveEvent['outcome']

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  const ss = String(d.getSeconds()).padStart(2, '0')
  return `${hh}:${mm}:${ss}`
}

function formatDuration(ms: number | undefined): string {
  if (ms === undefined) return '—'
  if (ms < 1_000) return `${ms}ms`
  return `${(ms / 1_000).toFixed(2)}s`
}

function dotClass(outcome: ObserveEvent['outcome']): string {
  if (outcome === 'success') return styles.dotSuccess ?? ''
  if (outcome === 'cancelled') return styles.dotCancelled ?? ''
  return styles.dotError ?? ''
}

/** Render the live tool/LLM observation timeline with filters and grouping. */
export function ObserveTab({ snapshot, t }: ObserveTabProps): ReactNode {
  const [data, setData] = useState<ObserveSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [auto, setAuto] = useState<boolean>(true)
  const [kindFilter, setKindFilter] = useState<KindFilter>('all')
  const [outcomeFilter, setOutcomeFilter] = useState<OutcomeFilter>('all')

  const refresh = useCallback(async () => {
    try {
      setData(await snapshot())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [snapshot])

  useEffect(() => { void refresh() }, [refresh])

  useEffect(() => {
    if (!auto) return
    const timer = setInterval(() => { void refresh() }, AUTO_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [auto, refresh])

  /** Filtered events, newest first. */
  const filtered = useMemo(() => {
    if (!data) return []
    return data.events.filter((e) =>
      (kindFilter === 'all' || e.kind === kindFilter) &&
      (outcomeFilter === 'all' || e.outcome === outcomeFilter))
  }, [data, kindFilter, outcomeFilter])

  /** Group the filtered timeline into tool-call and LLM-stream sections. */
  const groups = useMemo(() => {
    const tool = filtered.filter((e) => e.kind === 'tool.call')
    const llm = filtered.filter((e) => e.kind === 'llm.stream')
    return [
      { kind: 'tool.call' as const, events: tool },
      { kind: 'llm.stream' as const, events: llm },
    ].filter((g) => g.events.length > 0)
  }, [filtered])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }
  if (!data) {
    return <div className={styles.root}><div className={styles.empty}>{t('empty')}</div></div>
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.tools')}: {data.stats.toolCalls}</span>
        <span className={styles.stat}>{t('stats.llm')}: {data.stats.llmStreams}</span>
        <span className={data.stats.errorCount > 0 ? styles.statError : styles.stat}>
          {t('stats.errors')}: {data.stats.errorCount}
        </span>
        {data.stats.droppedCount > 0 && (
          <span className={styles.stat}>{t('stats.dropped')}: {data.stats.droppedCount}</span>
        )}
        <button
          className={`${styles.autoToggle} ${auto ? styles.autoOn : ''}`}
          type="button"
          onClick={() => setAuto((v) => !v)}
        >
          {t('auto')}
        </button>
        <button className={styles.refresh} type="button" onClick={() => void refresh()}>
          {t('refresh')}
        </button>
      </div>
      <div className={styles.filters}>
        <label className={styles.filterLabel}>
          {t('filter.kind')}
          <select
            className={styles.filterSelect}
            value={kindFilter}
            onChange={(e) => setKindFilter(e.target.value as KindFilter)}
          >
            <option value="all">{t('filter.all')}</option>
            <option value="tool.call">{t('kind.tool')}</option>
            <option value="llm.stream">{t('kind.llm')}</option>
          </select>
        </label>
        <label className={styles.filterLabel}>
          {t('filter.outcome')}
          <select
            className={styles.filterSelect}
            value={outcomeFilter}
            onChange={(e) => setOutcomeFilter(e.target.value as OutcomeFilter)}
          >
            <option value="all">{t('filter.all')}</option>
            <option value="success">{t('outcome.success')}</option>
            <option value="error">{t('outcome.error')}</option>
            <option value="cancelled">{t('outcome.cancelled')}</option>
          </select>
        </label>
        {kindFilter !== 'all' || outcomeFilter !== 'all' ? (
          <button
            className={styles.clearFilter}
            type="button"
            onClick={() => { setKindFilter('all'); setOutcomeFilter('all') }}
          >
            {t('filter.clear')}
          </button>
        ) : null}
      </div>
      <div className={styles.panel}>
        <div className={styles.panelTitle}>
          {t('panel.title')}
          <span className={styles.panelRate}>
            {t('panel.errorRate')}: {(data.stats.errorRate * 100).toFixed(1)}%
          </span>
        </div>
        <div className={styles.panelGrid}>
          <div className={styles.panelCol}>
            <div className={styles.panelColTitle}>{t('panel.topTools')}</div>
            {data.stats.topTools.length === 0 && <div className={styles.panelEmpty}>{t('panel.empty')}</div>}
            {data.stats.topTools.map((tool) => (
              <div key={tool.name} className={styles.panelRow} title={tool.name}>
                <span className={styles.panelName}>{tool.name}</span>
                <span className={styles.panelStat}>{tool.calls}×</span>
                <span className={`${styles.panelStat} ${tool.errors > 0 ? styles.panelErr : ''}`}>
                  {t('panel.errors')}: {tool.errors}
                </span>
                <span className={styles.panelBarWrap}>
                  <span
                    className={tool.errorRate > 0 ? styles.panelBarErr : styles.panelBar}
                    style={{ width: `${Math.min(tool.errorRate * 100, 100)}%` }}
                  />
                </span>
              </div>
            ))}
          </div>
          <div className={styles.panelCol}>
            <div className={styles.panelColTitle}>{t('panel.topModels')}</div>
            {data.stats.topModels.length === 0 && <div className={styles.panelEmpty}>{t('panel.empty')}</div>}
            {data.stats.topModels.map((model) => (
              <div key={model.name} className={styles.panelRow} title={model.name}>
                <span className={styles.panelName}>{model.name}</span>
                <span className={styles.panelStat}>{model.streams}×</span>
                <span className={styles.panelStat}>{formatDuration(model.avgDurationMs)}</span>
                <span className={styles.panelStat}>{t('panel.chunks')}: {model.totalChunks}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className={styles.timeline}>
        {groups.length === 0 && <div className={styles.row}><span className={styles.empty}>{t('empty')}</span></div>}
        {groups.map((group) => (
          <div key={group.kind} className={styles.group}>
            <div className={styles.groupTitle}>
              {group.kind === 'llm.stream' ? t('group.llm') : t('group.tool')}
              <span className={styles.groupCount}>{group.events.length}</span>
            </div>
            {group.events.map((event) => (
              <div key={event.id} className={`${styles.row} ${event.outcome === 'error' ? styles.rowError : ''}`}>
                <span className={`${styles.dot} ${dotClass(event.outcome)}`} />
                <span className={`${styles.kind} ${event.kind === 'llm.stream' ? styles.kindLlm : ''}`}>
                  {event.kind === 'llm.stream' ? t('kind.llm') : t('kind.tool')}
                </span>
                <span className={styles.name} title={event.name}>{event.name}</span>
                {event.agent && <span className={styles.agent}>{event.agent}</span>}
                {event.source === 'mcp' && <span className={styles.mcp}>{t('source.mcp')}</span>}
                <span className={styles.duration}>{formatDuration(event.durationMs)}</span>
                <span className={styles.time}>{formatTime(event.startedAt)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
