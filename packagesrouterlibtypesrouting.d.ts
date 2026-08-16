/**
 * Router scoring core — pure functions, no I/O.
 *
 * Ported from the ai-bridge `routing-score.js` (7-dimension explainable
 * Bayesian routing): success, capability, latency, token cost, freshness,
 * stability, confidence. Only signals the system actually has are used:
 * run outcomes, durations, token usage, recency. "Cost" is average token
 * consumption, not a currency conversion.
 */
export declare const DAY_MS: number;
export declare const DEFAULT_WEIGHTS: Readonly<{
    success: 0.3;
    capability: 0.2;
    latency: 0.15;
    tokenCost: 0.1;
    freshness: 0.1;
    stability: 0.1;
    confidence: 0.05;
}>;
export type RoutingWeights = typeof DEFAULT_WEIGHTS;
/** One historical observation of a provider run. */
export interface RouterObservation {
    /** ISO timestamp of the run. */
    readonly ts: string;
    /** Whether the run settled successfully. */
    readonly success: boolean;
    readonly durationMs?: number;
    readonly tokens?: number;
    readonly task?: string;
    readonly category?: string;
    /** Caller session key when resolvable — the session-aware routing dimension. */
    readonly agent?: string;
}
/** Aggregated per-provider routing profile (the explainable score inputs). */
export interface RouterProfile {
    readonly name: string;
    readonly id: string;
    readonly canonicalId: string;
    readonly calls: number;
    readonly successes: number;
    readonly weightedCalls: number;
    readonly weightedSuccesses: number;
    readonly successScore: number;
    readonly stabilityScore: number;
    readonly confidence: number;
    readonly freshness: number;
    readonly averageDurationMs: number | null;
    readonly averageTokens: number | null;
    readonly lastObservedAt: string | null;
    readonly lastSuccessAt: string | null;
    readonly lastFailureAt: string | null;
    readonly cooldownUntil: string | null;
    readonly coolingDown: boolean;
    readonly categoryStats: Record<string, {
        calls: number;
        successes: number;
    }>;
    /** Per-session aggregates — the session-aware routing dimension. */
    readonly agentStats: Record<string, {
        calls: number;
        successes: number;
    }>;
}
/** Scored profile: base profile + category-specific score + ranking metadata. */
export interface ScoredRouterProfile extends RouterProfile {
    readonly category: string;
    readonly score: number;
    readonly components: Record<string, number>;
    readonly explorationBonus: number;
    readonly reason: string;
}
/** Classify a task description into a coarse category for capability scoring. */
export declare function classifyTask(task: string): string;
export interface RoutingInput {
    readonly name: string;
    readonly id: string;
    readonly canonicalId: string;
    readonly observations: readonly RouterObservation[];
    readonly tokenSummary?: {
        readonly calls?: number;
        readonly total?: number;
        readonly lastDuration?: number;
    };
}
/** Build a provider's routing profile from its observation history. */
export declare function buildRoutingProfile(tool: {
    readonly name: string;
    readonly id: string;
    readonly canonicalId: string;
}, observations: readonly RouterObservation[], tokenSummary?: {
    readonly calls?: number;
    readonly total?: number;
    readonly lastDuration?: number;
}, now?: number): RouterProfile;
/** Score one profile for a task category, with explainable components. */
export declare function scoreRoutingProfile(profile: RouterProfile, category: string, weights?: RoutingWeights): ScoredRouterProfile;
/** Rank a set of provider profiles for one task, best first. */
export declare function rankRoutingProfiles(profiles: readonly RouterProfile[], task: string, weights?: RoutingWeights): ScoredRouterProfile[];
//# sourceMappingURL=routing.d.ts.map