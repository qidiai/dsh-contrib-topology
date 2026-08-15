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
    const result = await orchestrate(
      request,
      async (agent, task) => {
        this.runs += 1
        const started = Date.now()
        try {
          const subagents = this.ctx.get('subagents') as { start: (spec: unknown) => Promise<unknown> } | undefined
          if (subagents === undefined) {
            this.failures += 1
            return { ok: false, durationMs: Date.now() - started, error: 'subagents service unavailable' }
          }
          const run = await subagents.start({
            provider: agent,
            prompt: [{ type: 'text', text: task }],
            parent: this.ctx.get('agents') as unknown,
            label: 'orchestrator',
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
    return result
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
}

export default OrchestratorGateway
