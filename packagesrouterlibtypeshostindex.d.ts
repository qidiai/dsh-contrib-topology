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
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { RouterRankResult, RouterSnapshot } from '../types.ts';
export type * from '../types.ts';
/** Remote-only service exposing the live provider routing scores. */
export declare class RouterGateway extends TypertRemoteService {
    private readonly observations;
    private readonly runStarts;
    constructor(ctx: Context);
    /** Record the start timestamp for a delegation, keyed by run id. */
    private readonly onStart;
    /** Append the run outcome to its provider's history. */
    private readonly onEnd;
    /** Build one provider's wire-safe profile snapshot. */
    private profileOf;
    /** All observed provider profiles (cheap polling view). */
    profiles(): RouterSnapshot;
    /**
     * Rank the given candidates for one task; defaults to all observed providers.
     * @param task - the delegation task text (category-classified internally).
     * @param candidates - optional provider-name allowlist; empty = all observed.
     */
    rank(task: string, candidates?: readonly string[]): RouterRankResult;
}
export default RouterGateway;
//# sourceMappingURL=index.d.ts.map