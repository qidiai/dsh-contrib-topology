/**
 * Host-side orchestrator gateway.
 *
 * Exposes the orchestration engine (five dispatch modes, ported from
 * ai-bridge's MultiAgentDispatcher) as Typert Remotes. The execution seam
 * binds the engine's injected callback to `ctx.subagents.start()` — the
 * harness's native delegation — and every run is echoed through
 * `subagent/start`/`subagent/end` listeners so observe/router see it too.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { OrchestratorRequest, OrchestratorResult, OrchestratorSnapshot, OrchestratorStats } from '../types.ts';
export type * from '../types.ts';
/** Remote-only service exposing live orchestration. */
export declare class OrchestratorGateway extends TypertRemoteService {
    private dispatches;
    private runs;
    private successes;
    private failures;
    private readonly byMode;
    private readonly history;
    constructor(ctx: Context);
    private readonly onStart;
    private readonly onEnd;
    /** Execute one dispatch through the native subagent seam. */
    dispatch(request: OrchestratorRequest): Promise<OrchestratorResult>;
    /** Aggregate dispatch counters. */
    stats(): OrchestratorStats;
    /** Recent dispatch history plus counters (cheap polling view). */
    snapshot(): OrchestratorSnapshot;
}
export default OrchestratorGateway;
//# sourceMappingURL=index.d.ts.map