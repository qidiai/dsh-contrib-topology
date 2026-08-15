/**
 * Router settings tab — explainable subagent-provider routing.
 *
 * Shows the observed provider profiles (calls/success/confidence/freshness)
 * and lets you score/rank providers for a task description, with per-dimension
 * components and a plain-language reason for each candidate.
 */

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import type { RouterProviderProfile, RouterRankResult, RouterSnapshot } from '../types.ts'
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import styles from './RouterTab.module.css'

export interface RouterTabInjected {
  /** Fetch all observed provider profiles. */
  profiles(): Promise<RouterSnapshot>
  /** Score/rank providers for one task. */
  rank(task: string, candidates?: readonly string[]): Promise<RouterRankResult>
}

/** Full component props assembled by the Settings slot renderer. */
export type RouterTabProps =
  PropsRuntime<'settings.plugins.tab'>
  & PropsLocale<'settings.pluginRouter'>
  & InjectFace<RouterTabInjected>

function fmtDuration(ms: number | null): string {
  if (ms === null) return '—'
  if (ms < 1_000) return `${ms}ms`
  return `${(ms / 1_000).toFixed(1)}s`
}

function fmtRate(value: number): string {
  return `${(value * 100).toFixed(0)}%`
}

/** Render the live provider routing profiles and task ranking. */
export function RouterTab({ profiles, rank, t }: RouterTabProps): ReactNode {
  const [data, setData] = useState<RouterSnapshot | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [task, setTask] = useState('')
  const [candidates, setCandidates] = useState('')
  const [ranking, setRanking] = useState<RouterRankResult | null>(null)

  const refresh = useCallback(async () => {
    try {
      setData(await profiles())
      setError(null)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [profiles])

  useEffect(() => { void refresh() }, [refresh])

  const runRank = useCallback(async () => {
    if (!task.trim()) return
    setError(null)
    try {
      const parsed = candidates.split(',').map((s) => s.trim()).filter(Boolean)
      setRanking(await rank(task, parsed.length > 0 ? parsed : undefined))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }, [task, candidates, rank])

  if (error) {
    return <div className={styles.root}><div className={styles.error}>{error}</div></div>
  }

  const providers: readonly RouterProviderProfile[] = data?.providers ?? []

  return (
    <div className={styles.root}>
      <div className={styles.header}>
        <span className={styles.title}>{t('title')}</span>
        <span className={styles.stat}>{t('stats.providers')}: {providers.length}</span>
        <span className={styles.stat}>{t('stats.calls')}: {providers.reduce((a, p) => a + p.calls, 0)}</span>
        <span className={styles.stat}>{t('stats.successes')}: {providers.reduce((a, p) => a + p.successes, 0)}</span>
        <button className={styles.refresh} type="button" onClick={() => void refresh()}>{t('refresh')}</button>
      </div>

      <div className={styles.rankBox}>
        <input
          className={styles.taskInput}
          placeholder={t('field.task')}
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <input
          className={styles.taskInput}
          placeholder={t('field.candidates')}
          value={candidates}
          onChange={(e) => setCandidates(e.target.value)}
        />
        <button className={styles.rankBtn} type="button" onClick={() => void runRank()} disabled={!task.trim()}>
          {t('btn.rank')}
        </button>
      </div>

      {ranking && (
        <div className={styles.ranking}>
          <div className={styles.rankTitle}>
            {t('rank.title')} · {t('rank.category')}: {ranking.category}
          </div>
          {ranking.ranked.map((entry, i) => (
            <div key={entry.name} className={styles.rankRow}>
              <span className={styles.rankPos}>{i + 1}</span>
              <span className={styles.rankName}>{entry.name}</span>
              <span className={styles.rankScore}>{t('rank.score')}: {entry.score.toFixed(3)}</span>
              {entry.profile.coolingDown && <span className={styles.cooling}>{t('rank.cooling')}</span>}
              <span className={styles.rankReason} title={entry.reason}>{entry.reason}</span>
            </div>
          ))}
        </div>
      )}

      <div className={styles.profiles}>
        {providers.length === 0 && <div className={styles.empty}>{t('empty')}</div>}
        {providers.map((p) => (
          <div key={p.name} className={styles.profileRow}>
            <span className={styles.profileName}>{p.name}</span>
            <span className={styles.profileStat}>{t('profile.success')}: {fmtRate(p.successScore)}</span>
            <span className={styles.profileStat}>{t('profile.confidence')}: {fmtRate(p.confidence)}</span>
            <span className={styles.profileStat}>{t('profile.freshness')}: {fmtRate(p.freshness)}</span>
            <span className={styles.profileStat}>{t('profile.stability')}: {fmtRate(p.stabilityScore)}</span>
            <span className={styles.profileStat}>{t('profile.latency')}: {fmtDuration(p.averageDurationMs)}</span>
            <span className={styles.profileStat}>{t('profile.tokens')}: {p.averageTokens === null ? '—' : Math.round(p.averageTokens)}</span>
            {p.coolingDown && <span className={styles.cooling}>{t('rank.cooling')}</span>}
          </div>
        ))}
      </div>
    </div>
  )
}
