/**
 * Host-side router gateway.
 *
 * Scores subagent providers from observed run history using the 7-dimension
 * Bayesian routing core. Listens to the delegation lifecycle events
 * (`subagent/start` → `subagent/end`) and keeps a per-provider observation
 * ring, then exposes `rank()` (explainable ordering for one task) and
 * `profiles()` (all provider snapshots) as Typert Remotes — the same
 * remote/roster pattern as observe/topology.
 *
 * Non-invasive by construction: only `ctx.on(...)` listeners, no injected
 * services, no mutation of the delegation path.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SubagentRunEndInfo, SubagentRunInfo } from '@deepseek-ai/dsh-subagent'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type { RouterProviderProfile, RouterRankResult, RouterSnapshot } from '../types.ts'
import { buildRoutingProfile, rankRoutingProfiles, type RouterObservation } from '../routing.ts'

export type * from '../types.ts'

/** Per-provider observation history (ring-capped, newest last). */
const MAX_OBSERVATIONS_PER_PROVIDER = 500

/** Remote-only service exposing the live provider routing scores. */
export class RouterGateway extends TypertRemoteService {
  private readonly observations = new Map<string, RouterObservation[]>()
  private readonly runStarts = new Map<string, number>()

  constructor(ctx: Context) {
    super(ctx, 'router')
    ctx.on('subagent/start', this.onStart)
    ctx.on('subagent/end', this.onEnd)
  }

  /** Record the start timestamp for a delegation, keyed by run id. */
  private readonly onStart = (info: SubagentRunInfo): void => {
    this.runStarts.set(info.runId, Date.now())
  }

  /** Append the run outcome to its provider's history. */
  private readonly onEnd = (info: SubagentRunEndInfo): void => {
    const startedAt = this.runStarts.get(info.runId)
    this.runStarts.delete(info.runId)
    const success = info.stopReason === 'completed'
    const observation: RouterObservation = {
      ts: new Date(startedAt ?? Date.now()).toISOString(),
      success,
      ...(startedAt === undefined ? {} : { durationMs: Date.now() - startedAt }),
      // The child session id is the session-aware routing key (same key
      // observe uses for its `agent` dimension).
      ...(info.id ? { agent: info.id } : {}),
    }
    const history = this.observations.get(info.provider) ?? []
    history.push(observation)
    if (history.length > MAX_OBSERVATIONS_PER_PROVIDER) {
      history.splice(0, history.length - MAX_OBSERVATIONS_PER_PROVIDER)
    }
    this.observations.set(info.provider, history)
  }

  /** Build one provider's wire-safe profile snapshot. */
  private profileOf(name: string): RouterProviderProfile {
    const observations = this.observations.get(name) ?? []
    const profile = buildRoutingProfile({ name, id: name, canonicalId: name }, observations)
    return {
      name: profile.name,
      id: profile.id,
      canonicalId: profile.canonicalId,
      calls: profile.calls,
      successes: profile.successes,
      weightedCalls: profile.weightedCalls,
      weightedSuccesses: profile.weightedSuccesses,
      successScore: profile.successScore,
      stabilityScore: profile.stabilityScore,
      confidence: profile.confidence,
      freshness: profile.freshness,
      averageDurationMs: profile.averageDurationMs,
      averageTokens: profile.averageTokens,
      lastObservedAt: profile.lastObservedAt,
      lastSuccessAt: profile.lastSuccessAt,
      lastFailureAt: profile.lastFailureAt,
      cooldownUntil: profile.cooldownUntil,
      coolingDown: profile.coolingDown,
      agentStats: profile.agentStats,
    }
  }

  /** All observed provider profiles (cheap polling view). */
  @Remote('profiles')
  profiles(): RouterSnapshot {
    return {
      providers: [...this.observations.keys()].map((name) => this.profileOf(name)),
      capturedAt: new Date().toISOString(),
    }
  }

  /**
   * Rank the given candidates for one task; defaults to all observed providers.
   * @param task - the delegation task text (category-classified internally).
   * @param candidates - optional provider-name allowlist; empty = all observed.
   */
  @Remote('rank')
  rank(task: string, candidates?: readonly string[]): RouterRankResult {
    const names = candidates && candidates.length > 0
      ? [...candidates]
      : [...this.observations.keys()]
    const profiles = names.map((name) => buildRoutingProfile({ name, id: name, canonicalId: name }, this.observations.get(name) ?? []))
    const ranked = rankRoutingProfiles(profiles, task)
    return {
      task,
      category: ranked[0]?.category ?? 'general',
      ranked: ranked.map((r) => ({
        name: r.name,
        score: r.score,
        category: r.category,
        components: r.components,
        explorationBonus: r.explorationBonus,
        reason: r.reason,
        profile: this.profileOf(r.name),
      })),
      capturedAt: new Date().toISOString(),
    }
  }
}

export default RouterGateway
