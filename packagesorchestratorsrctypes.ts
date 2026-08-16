/**
 * Shared contract between the orchestrator Host gateway and the Web client.
 *
 * Ported control-flow shape from the ai-bridge MultiAgentDispatcher: five
 * dispatch modes (parallel / sequential / select / cascade / merge) plus
 * per-agent retry. The execution seam is `ctx.subagents.start()` — qidi's
 * AgentHub/MergeEngine are replaced by the harness's native delegation.
 */

/** Dispatch modes supported by the orchestrator. */
export type OrchestratorMode = 'parallel' | 'sequential' | 'select' | 'cascade' | 'merge'

/** One delegation attempt within a dispatch. */
export interface OrchestratorRun {
  readonly agent: string
  readonly ok: boolean
  readonly durationMs: number
  readonly error?: string
  /** Delegated child's final text output (merge mode aggregates these). */
  readonly output?: string
}

/** Dispatch request accepted by the orchestrator Remote. */
export interface OrchestratorRequest {
  /** Task description delivered to every delegated child. */
  readonly task: string
  /** Candidate provider names; empty = all providers known to the registry. */
  readonly agents?: readonly string[]
  /** Dispatch mode (default `parallel`). */
  readonly mode?: OrchestratorMode
  /** Max concurrent delegations in parallel/merge modes (default 3). */
  readonly parallelLimit?: number
  /** Per-agent retry count on failure (default 0). */
  readonly retryCount?: number
  /** Optional task hint used by the router seam (defaults to the task text). */
  readonly routeHint?: string
  /**
   * Optional session id whose live agent becomes the delegating parent.
   * Required by the subagent providers for lineage/depth; when absent the
   * gateway falls back to `agents.currentInitiator()`.
   */
  readonly parentSessionId?: string
}

/** Result of one dispatch. */
export interface OrchestratorResult {
  readonly task: string
  readonly mode: OrchestratorMode
  readonly runs: readonly OrchestratorRun[]
  /** First successful run's agent (select/cascade), else the best one. */
  readonly winner?: string
  /** merge mode: structured aggregation of successful runs' outputs. */
  readonly merged?: string
  readonly allOk: boolean
  readonly startedAt: string
  readonly durationMs: number
  /**
   * Router ranking evidence attached when `mode === 'select'` and the
   * router seam ran — candidate order, score, and reason for the decision.
   */
  readonly ranked?: readonly OrchestratorRankEvidence[]
}

/** One ranked candidate's decision evidence (select-mode transparency). */
export interface OrchestratorRankEvidence {
  readonly agent: string
  readonly score: number
  readonly reason: string
  readonly coolingDown: boolean
}

/** Aggregate dispatch counters (cheap polling view). */
export interface OrchestratorStats {
  readonly dispatches: number
  readonly runs: number
  readonly successes: number
  readonly failures: number
  readonly byMode: Record<string, number>
}

/** Recent dispatch history entry. */
export interface OrchestratorHistoryEntry {
  readonly startedAt: string
  readonly task: string
  readonly mode: OrchestratorMode
  readonly winner?: string
  readonly allOk: boolean
  readonly durationMs: number
}

/** Point-in-time orchestrator snapshot. */
export interface OrchestratorSnapshot {
  readonly stats: OrchestratorStats
  readonly history: readonly OrchestratorHistoryEntry[]
  readonly capturedAt: string
}
