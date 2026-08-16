/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Five expandable cards, one per plugin. Read-only inline views (timeline /
 * ranking / history / servers) for the four data plugins; the topology card
 * shows a per-kind node summary and points to the topology tab for the full
 * SVG graph (which lives in the topology plugin's own tab — no duplicated
 * renderer). Configuration actions stay in each plugin's tab.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { DashboardStatus, ObserveEventLite } from '../types.ts'
import type { DashboardLocaleKey } from './locales.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './DashboardTab.module.css'

export interface DashboardTabInjected {
  /** Aggregated suite state, assembled from the five plugin Remotes. */
  status(): Promise<DashboardStatus>
}

/** Full component props assembled by the Settings slot renderer. */
export type DashboardTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginDashboard'>
  & InjectFace<DashboardTabInjected>

type CardKey = 'topology' | 'observe' | 'router' | 'orchestrator' | 'mcpBridge'
const CARD_KEYS: readonly CardKey[] = ['topology', 'observe', 'router', 'orchestrator', 'mcpBridge']

const EVENT_LABEL: Record<ObserveEventLite['kind'], string> = {
  'tool.call': 'tool',
  'llm.stream': 'llm',
  'subagent.dispatch': 'sub',
}

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString()
}

/** Render the suite dashboard: five expandable cards in one tab. */
export function DashboardTab({ status, t }: DashboardTabProps): ReactNode {
  const [data, setData] = useState<DashboardStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<CardKey | null>(null)

  const refresh = useCallback(async () => {
    setBusy(true)
    try {
      setData(await status())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [status])

  useEffect(() => { void refresh() }, [refresh])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.subtitle}>{t('subtitle')}</span>
        <button className={styles.refresh} type="button" onClick={() => void refresh()} disabled={busy}>
          {busy ? '…' : t('refresh')}
        </button>
      </div>
      {data === null && <div className={styles.empty}>{t('empty')}</div>}
      {data !== null && (
        <>
          <div className={styles.grid}>
            {CARD_KEYS.map((key) => (
              <div
                key={key}
                className={`${styles.card} ${data[key].ok ? styles.ok : styles.warn} ${open === key ? styles.cardOpen : ''}`}
              >
                <button type="button" className={styles.cardHeader} onClick={() => setOpen((cur) => (cur === key ? null : key))}>
                  <span className={styles.cardName}>{t(`card.${key}`)}</span>
                  <span className={styles.cardDetail} title={data[key].detail}>{data[key].detail}</span>
                  <span className={styles.cardToggle}>{open === key ? '▾' : '▸'}</span>
                </button>
                {open === key && (
                  <div className={styles.cardBody}>
                    {renderCardBody(key, data[key], t)}
                  </div>
                )}
              </div>
            ))}
          </div>
          <div className={styles.footer}>{t('captured')}: {fmtTime(data.capturedAt)}</div>
        </>
      )}
    </div>
  )
}

/** Read-only inline view per card (no duplicated heavyweight renderers). */
function renderCardBody(
  key: CardKey,
  card: DashboardStatus[CardKey],
  t: (key: DashboardLocaleKey) => string,
): ReactNode {
  switch (key) {
    case 'topology': {
      const s = (card as DashboardStatus['topology']).summary
      if (!s) return <div className={styles.bodyMuted}>{t('body.noData')}</div>
      return (
        <div className={styles.summary}>
          <span>{t('summary.plugins')}: <b>{s.plugins}</b></span>
          <span>{t('summary.services')}: <b>{s.services}</b></span>
          <span>{t('summary.subagents')}: <b>{s.subagents}</b></span>
          <span>{t('summary.mcp')}: <b>{s.mcps}</b></span>
          <span>{t('summary.edges')}: <b>{s.edges}</b></span>
          <span className={styles.goto}>{t('topology.goto')}</span>
        </div>
      )
    }
    case 'observe': {
      const events = (card as DashboardStatus['observe']).events ?? []
      if (events.length === 0) return <div className={styles.bodyMuted}>{t('body.noData')}</div>
      return (
        <div className={styles.list}>
          {events.map((e, i) => (
            <div key={i} className={styles.row}>
              <span className={`${styles.kind} ${styles[`kind${e.kind.split('.').join('')}`] ?? styles.kindDefault}`}>{EVENT_LABEL[e.kind] ?? e.kind}</span>
              <span className={styles.rowName} title={e.name}>{e.name}</span>
              <span className={`${styles.outcome} ${e.outcome === 'success' ? styles.ok : styles.fail}`}>{e.outcome}</span>
              <span className={styles.rowMeta}>{e.source}{e.durationMs !== undefined ? ` · ${e.durationMs}ms` : ''}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'router': {
      const providers = (card as DashboardStatus['router']).providers ?? []
      if (providers.length === 0) return <div className={styles.bodyMuted}>{t('body.noData')}</div>
      return (
        <div className={styles.list}>
          {providers.map((p) => (
            <div key={p.name} className={styles.row}>
              <span className={styles.rowName} title={p.name}>{p.name}</span>
              <span className={styles.rowMeta}>{p.calls} calls / {p.successes} ok</span>
              <span className={styles.scoreBar} title={`score ${p.successScore.toFixed(3)}`}>
                <span className={styles.scoreFill} style={{ width: `${Math.round(p.successScore * 100)}%` }} />
              </span>
              <span className={styles.rowMeta}>{p.successScore.toFixed(2)}{p.coolingDown ? ` · ${t('rank.cooling')}` : ''}</span>
            </div>
          ))}
        </div>
      )
    }
    case 'orchestrator': {
      const history = (card as DashboardStatus['orchestrator']).history ?? []
      if (history.length === 0) return <div className={styles.bodyMuted}>{t('body.noData')}</div>
      return (
        <div className={styles.list}>
          {history.map((h, i) => (
            <div key={i} className={styles.row}>
              <span className={styles.kindDefault}>{h.mode}</span>
              <span className={styles.rowName} title={h.task}>{h.task}</span>
              {h.winner && <span className={styles.rowMeta}>← {h.winner}</span>}
              <span className={`${styles.outcome} ${h.allOk ? styles.ok : styles.fail}`}>{h.allOk ? 'ok' : 'fail'}</span>
              <span className={styles.rowMeta}>{h.durationMs}ms</span>
            </div>
          ))}
        </div>
      )
    }
    case 'mcpBridge': {
      const servers = (card as DashboardStatus['mcpBridge']).servers ?? []
      if (servers.length === 0) return <div className={styles.bodyMuted}>{t('body.noData')}</div>
      return (
        <div className={styles.list}>
          {servers.map((s) => (
            <div key={s.serverName} className={styles.row}>
              <span className={styles.rowName} title={s.serverName}>{s.serverName}</span>
              <span className={`${styles.outcome} ${s.status === 'connected' ? styles.ok : styles.fail}`}>{s.status}</span>
              <span className={styles.rowMeta}>{s.toolCount} tools</span>
              {s.lastError && <span className={styles.rowMeta} title={s.lastError}>{s.lastError.slice(0, 24)}…</span>}
            </div>
          ))}
        </div>
      )
    }
  }
}
