/**
 * Shared contract between the router Host gateway and the Web client.
 *
 * The router scores subagent providers from observed run history (the same
 * signal source as observe, but focused on delegation outcomes) using the
 * 7-dimension Bayesian routing core in `routing.ts`. `rank()` returns an
 * explainable ordering — components + reason per provider — so the model or
 * an orchestrator can delegate to the best candidate with visible rationale.
 */

/** One provider's aggregated history snapshot (wire-safe subset). */
export interface RouterProviderProfile {
  readonly name: string
  readonly id: string
  readonly canonicalId: string
  readonly calls: number
  readonly successes: number
  readonly weightedCalls: number
  readonly weightedSuccesses: number
  readonly successScore: number
  readonly stabilityScore: number
  readonly confidence: number
  readonly freshness: number
  readonly averageDurationMs: number | null
  readonly averageTokens: number | null
  readonly lastObservedAt: string | null
  readonly lastSuccessAt: string | null
  readonly lastFailureAt: string | null
  readonly cooldownUntil: string | null
  readonly coolingDown: boolean
  /** Per-session aggregates — the session-aware routing dimension. */
  readonly agentStats: Record<string, { calls: number; successes: number }>
}

/** One scored candidate within a rank result. */
export interface RouterRankEntry {
  readonly name: string
  readonly score: number
  readonly category: string
  readonly components: Record<string, number>
  readonly explorationBonus: number
  readonly reason: string
  readonly profile: RouterProviderProfile
}

/** Point-in-time ranking for one task. */
export interface RouterRankResult {
  readonly task: string
  readonly category: string
  readonly ranked: readonly RouterRankEntry[]
  readonly capturedAt: string
}

/** All observed provider profiles (cheap polling view). */
export interface RouterSnapshot {
  readonly providers: readonly RouterProviderProfile[]
  readonly capturedAt: string
}
