/**
 * Orchestrator settings tab — five-mode multi-agent dispatch.
 *
 * Shows aggregate dispatch counters and recent history, and lets you run a
 * dispatch on demand: task text + optional candidate providers + mode.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { OrchestratorMode, OrchestratorResult, OrchestratorSnapshot } from '../types.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './OrchestratorTab.module.css'

export interface OrchestratorTabInjected {
  /** Fetch the orchestrator snapshot (stats + history). */
  snapshot(): Promise<OrchestratorSnapshot>
  /** Run one dispatch. */
  dispatch(task: string, agents: string[], mode: OrchestratorMode): Promise<OrchestratorResult>
}

/** Full component props assembled by the Settings slot renderer. */
export type OrchestratorTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginOrchestrator'>
  & InjectFace<OrchestratorTabInjected>

const MODES: readonly OrchestratorMode[] = ['parallel', 'sequential', 'select', 'cascade', 'merge']

/** Locale keys indexed by mode (safe for the strongly-typed `t`). */
const MODE_KEYS: Record<OrchestratorMode, 'mode.parallel' | 'mode.sequential' | 'mode.select' | 'mode.cascade' | 'mode.merge'> = {
  parallel: 'mode.parallel',
  sequential: 'mode.sequential',
  select: 'mode.select',
  cascade: 'mode.cascade',
  merge: 'mode.merge',
}

function fmtDuration(ms: number): string {
  if (ms < 1_000) return `${ms}ms`
  return `${(ms / 1_000).toFixed(1)}s`
}

/** Render the live orchestration counters, dispatch box, and history. */
export function OrchestratorTab({ snapshot, dispatch, t }: OrchestratorTabProps): ReactNode {
  const [data, setData] = useState<OrchestratorSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState('')
  const [agents, setAgents] = useState('')
  const [mode, setMode] = useState<OrchestratorMode>('parallel')
  const [busy, setBusy] = useState(false)
  const [lastResult, setLastResult] = useState<OrchestratorResult | null>(null)

  const refresh = useCallback(async () => {
    try {
      setData(await snapshot())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [snapshot])

  useEffect(() => { void refresh() }, [refresh])

  const runDispatch = useCallback(async () => {
    if (!task.trim() || busy) return
    setBusy(true)
    setError(null)
    try {
      const parsed = agents.split(',').map((s) => s.trim()).filter(Boolean)
      setLastResult(await dispatch(task, parsed, mode))
      setTask('')
      await refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setBusy(false)
    }
  }, [task, agents, mode, busy, dispatch, refresh])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }

  const stats = data?.stats

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.dispatches')}: {stats?.dispatches ?? 0}</span>
        <span className={styles.stat}>{t('stats.runs')}: {stats?.runs ?? 0}</span>
        <span className={styles.stat}>{t('stats.successes')}: {stats?.successes ?? 0}</span>
        <span className={styles.stat}>{t('stats.failures')}: {stats?.failures ?? 0}</span>
        <button className={styles.refresh} type="button" onClick={() => void refresh()}>{t('refresh')}</button>
      </div>

      <div className={styles.dispatchBox}>
        <input
          className={styles.taskInput}
          placeholder={t('field.task')}
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          className={styles.taskInput}
          placeholder={t('field.agents')}
          value={agents}
          onChange={(e) => setAgents(e.target.value)}
        />
        <select
          className={styles.modeSelect}
          value={mode}
          onChange={(e) => setMode(e.target.value as OrchestratorMode)}
        >
          {MODES.map((m) => <option key={m} value={m}>{t(MODE_KEYS[m])}</option>)}
        </select>
        <button className={styles.dispatchBtn} type="button" onClick={() => void runDispatch()} disabled={!task.trim() || busy}>
          {busy ? '…' : t('btn.dispatch')}
        </button>
      </div>

      {lastResult?.ranked !== undefined && (
        <div className={styles.ranking}>
          <div className={styles.rankTitle}>{t('rank.title')}</div>
          {lastResult.ranked.map((entry, i) => (
            <div key={entry.agent} className={styles.rankRow}>
              <span className={styles.rankPos}>{i + 1}</span>
              <span className={styles.rankName}>{entry.agent}</span>
              <span className={styles.rankScore}>{t('rank.score')}: {entry.score.toFixed(4)}</span>
              {entry.coolingDown && <span className={styles.cooling}>{t('rank.cooling')}</span>}
              <span className={styles.rankReason} title={entry.reason}>{entry.reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.history}>
        <div className={styles.historyTitle}>{t('history.title')}</div>
        {(data?.history.length ?? 0) === 0 && <div className={styles.empty}>{t('empty')}</div>}
        {data?.history.map((entry, i) => (
          <div key={`${entry.startedAt}-${i}`} className={styles.historyRow}>
            <span className={styles.historyMode}>{t(MODE_KEYS[entry.mode])}</span>
            <span className={styles.historyTask} title={entry.task}>{entry.task}</span>
            {entry.winner && <span className={styles.historyWinner}>{t('history.winner')}: {entry.winner}</span>}
            <span className={`${styles.historyOk} ${entry.allOk ? styles.ok : styles.fail}`}>
              {entry.allOk ? t('run.ok') : t('run.fail')}
            </span>
            <span className={styles.historyDuration}>{fmtDuration(entry.durationMs)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
