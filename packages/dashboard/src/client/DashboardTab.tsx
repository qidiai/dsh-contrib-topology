/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Aggregates the five plugins' live state by calling their Remotes directly:
 * topology.graph(), observe.snapshot(), router.profiles(),
 * orchestrator.snapshot(), mcp-bridge.snapshot(). Each card shows a compact
 * status line; a refresh button re-polls everything.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './DashboardTab.module.css'

export interface DashboardTabInjected {
  /** Aggregated suite state, assembled from the five plugin Remotes. */
  status(): Promise<DashboardCards>
}

/** One card's content. */
export interface DashboardCards {
  readonly topology: { ok: boolean; detail: string }
  readonly observe: { ok: boolean; detail: string }
  readonly router: { ok: boolean; detail: string }
  readonly orchestrator: { ok: boolean; detail: string }
  readonly mcpBridge: { ok: boolean; detail: string }
  readonly capturedAt: string
}

/** Full component props assembled by the Settings slot renderer. */
export type DashboardTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginDashboard'>
  & InjectFace<DashboardTabInjected>

const CARD_KEYS = ['topology', 'observe', 'router', 'orchestrator', 'mcpBridge'] as const

function fmtTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleTimeString()
}

/** Render the suite dashboard: five status cards in one tab. */
export function DashboardTab({ status, t }: DashboardTabProps): ReactNode {
  const [data, setData] = useState<DashboardCards | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
              <div key={key} className={`${styles.card} ${data[key].ok ? styles.ok : styles.warn}`}>
                <div className={styles.cardName}>{t(`card.${key}`)}</div>
                <div className={styles.cardStatus}>{data[key].ok ? t('status.ok') : t('status.warn')}</div>
                <div className={styles.cardDetail} title={data[key].detail}>{data[key].detail}</div>
              </div>
            ))}
          </div>
          <div className={styles.footer}>{t('captured')}: {fmtTime(data.capturedAt)}</div>
        </>
      )}
    </div>
  )
}
