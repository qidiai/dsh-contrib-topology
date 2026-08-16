/**
 * Orchestration engine — pure control-flow, no I/O.
 *
 * Ported from the ai-bridge MultiAgentDispatcher: five dispatch modes
 * (parallel / sequential / select / cascade / merge) plus per-agent retry.
 * Execution is injected as a callback so the host can bind it to
 * `ctx.subagents.start()` (the harness's native delegation seam).
 */
import type { OrchestratorRequest, OrchestratorResult, OrchestratorRun } from './types.ts';
/** Delegate one task to one provider. Returns the run outcome. */
export type RunExecutor = (agent: string, task: string) => Promise<Omit<OrchestratorRun, 'agent'>>;
export interface EngineOptions {
    readonly parallelLimit: number;
    readonly retryCount: number;
}
/**
 * Execute a dispatch. Mode semantics:
 * - parallel: all candidates concurrently (bounded), winner = best ok run.
 * - sequential: one after another until success; winner = first ok agent.
 * - select: pick the first candidate only (router seam is applied by the host
 *   before calling — the host reorders `agents` via the router rank Remote).
 * - cascade: try candidates in order until one succeeds.
 * - merge: all candidates concurrently, winner = best ok run, all outputs kept.
 */
export declare function orchestrate(request: OrchestratorRequest, run: RunExecutor, options?: EngineOptions): Promise<OrchestratorResult>;
//# sourceMappingURL=engine.d.ts.map