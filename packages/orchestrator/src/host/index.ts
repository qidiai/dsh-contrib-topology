/**
 * Host-side orchestrator gateway.
 *
 * Exposes the orchestration engine (five dispatch modes, ported from
 * ai-bridge's MultiAgentDispatcher) as Typert Remotes. The execution seam
 * binds the engine's injected callback to `ctx.subagents.start()` — the
 * harness's native delegation — and every run is echoed through
 * `subagent/start`/`subagent/end` listeners so observe/router see it too.
 */

import type { Context } from '@deepseek-ai/cordis'
import type { SubagentRunEndInfo, SubagentRunInfo } from '@deepseek-ai/dsh-subagent'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import { orchestrate } from '../engine.ts'
import type {
  OrchestratorHistoryEntry,
  OrchestratorRankEvidence,
  OrchestratorRequest,
  OrchestratorResult,
  OrchestratorSnapshot,
  OrchestratorStats,
} from '../types.ts'

export type * from '../types.ts'

/** Keep the most recent N dispatch history entries. */
const MAX_HISTORY = 50

/** Remote-only service exposing live orchestration. */
export class OrchestratorGateway extends TypertRemoteService {
  private dispatches = 0
  private runs = 0
  private successes = 0
  private failures = 0
  private readonly byMode: Record<string, number> = {}
  private readonly history: OrchestratorHistoryEntry[] = []

  constructor(ctx: Context) {
    super(ctx, 'orchestrator')
    ctx.on('subagent/start', this.onStart)
    ctx.on('subagent/end', this.onEnd)
  }

  private readonly onStart = (info: SubagentRunInfo): void => {
    // Orchestrated runs are counted via run completion; this listener exists
    // so the run is visible to observe/router and to track start timestamps.
    void info
  }

  private readonly onEnd = (info: SubagentRunEndInfo): void => {
    void info
  }

  /** Execute one dispatch through the native subagent seam. */
  @Remote('dispatch')
  async dispatch(request: OrchestratorRequest): Promise<OrchestratorResult> {
    const startedAt = new Date().toISOString()
    const mode = request.mode ?? 'parallel'
    // Ordered-attempt seam (select / sequential / cascade): reorder the
    // candidates by the router's Bayesian rank (best first) before delegating;
    // falls back to the caller's order when the router service is unavailable
    // or ranking fails. The rank evidence is carried into the result for
    // decision transparency in every ordered mode.
    let effective = request
    let rankEvidence: OrchestratorRankEvidence[] | undefined
    const orderedModes = mode === 'select' || mode === 'sequential' || mode === 'cascade'
    if (orderedModes && request.agents !== undefined && request.agents.length > 1) {
      try {
        const router = this.ctx.get('router') as
          | { rank?: (task: string, candidates?: readonly string[]) => Promise<{ ranked: readonly {
            name: string
            score: number
            reason: string
            profile: { coolingDown: boolean }
          }[] }> }
          | undefined
        if (router?.rank !== undefined) {
          const ranked = await router.rank(request.task, request.agents)
          const ordered = ranked.ranked.map((entry) => entry.name)
          if (ordered.length > 0) {
            effective = { ...request, agents: ordered }
            rankEvidence = ranked.ranked.map((entry) => ({
              agent: entry.name,
              score: entry.score,
              reason: entry.reason,
              coolingDown: entry.profile.coolingDown,
            }))
          }
        }
      } catch {
        // contained: a ranking failure must never break the dispatch
      }
    }
    const result = await orchestrate(
      effective,
      async (agent, task) => {
        this.runs += 1
        const started = Date.now()
        try {
          const subagents = this.ctx.get('subagents') as
            | { start: (name: string, request: unknown) => Promise<unknown> }
            | undefined
          if (subagents === undefined) {
            this.failures += 1
            return { ok: false, durationMs: Date.now() - started, error: 'subagents service unavailable' }
          }
          // SubagentRuntime.start(name, request): the provider is the FIRST
          // positional arg, not a field of the request; `signal` is required.
          // parent resolves from the requested session's live agent, falling
          // back to the current initiator when no session id was supplied.
          // When neither yields an Agent (e.g. a Remote-triggered dispatch
          // outside any initiator boundary), fail with a clear error instead of
          // letting the provider crash on `parent.options`.
          const agents = this.ctx.get('agents') as
            | { get?: (id: string) => unknown; currentInitiator?: () => unknown }
            | undefined
          const parent = request.parentSessionId !== undefined
            ? agents?.get?.(request.parentSessionId)
            : agents?.currentInitiator?.()
          if (parent === undefined) {
            this.failures += 1
            return {
              ok: false,
              durationMs: Date.now() - started,
              error: 'parent agent unavailable: dispatch needs a live session (pass parentSessionId) or an initiator boundary',
            }
          }
          const run = await subagents.start(agent, {
            prompt: [{ type: 'text', text: task }],
            parent: parent as never,
            label: 'orchestrator',
            signal: new AbortController().signal,
          })
          const ok = run !== undefined && typeof run === 'object'
          if (ok) this.successes += 1
          else this.failures += 1
          return { ok, durationMs: Date.now() - started }
        } catch (error) {
          this.failures += 1
          return { ok: false, durationMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) }
        }
      },
      {
        parallelLimit: request.parallelLimit ?? 3,
        retryCount: request.retryCount ?? 0,
      },
    )

    this.dispatches += 1
    this.byMode[mode] = (this.byMode[mode] ?? 0) + 1
    this.history.unshift({
      startedAt,
      task: result.task,
      mode: result.mode,
      ...(result.winner === undefined ? {} : { winner: result.winner }),
      allOk: result.allOk,
      durationMs: result.durationMs,
    })
    if (this.history.length > MAX_HISTORY) this.history.length = MAX_HISTORY
    return { ...result, ...(rankEvidence === undefined ? {} : { ranked: rankEvidence }) }
  }

  /** Aggregate dispatch counters. */
  @Remote('stats')
  stats(): OrchestratorStats {
    return {
      dispatches: this.dispatches,
      runs: this.runs,
      successes: this.successes,
      failures: this.failures,
      byMode: { ...this.byMode },
    }
  }

  /** Recent dispatch history plus counters (cheap polling view). */
  @Remote('snapshot')
  snapshot(): OrchestratorSnapshot {
    return {
      stats: this.stats(),
      history: [...this.history],
      capturedAt: new Date().toISOString(),
    }
  }

  /** Diagnostic: service visibility on this context (agents/subagents realm probe). */
  @Remote('probe')
  probe(): { agents: string; subagents: string; hasInitiator: boolean } {
    const agents = this.ctx.get('agents') as { currentInitiator?: () => unknown } | undefined
    let hasInitiator = false
    try {
      hasInitiator = agents?.currentInitiator?.() !== undefined
    } catch { /* contained */ }
    return {
      agents: agents === undefined ? 'undefined' : typeof agents,
      subagents: this.ctx.get('subagents') === undefined ? 'undefined' : typeof this.ctx.get('subagents'),
      hasInitiator,
    }
  }
}

export default OrchestratorGateway
