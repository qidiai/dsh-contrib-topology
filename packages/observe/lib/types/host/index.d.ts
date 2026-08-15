/**
 * Host-side observe gateway.
 *
 * Registers two strictly non-invasive listeners and projects what they see
 * into a queryable event window:
 *
 *   - `tools/execute` (waterfall): wraps `next()` to time the dispatch and
 *     classify the normalized result. The signal and the result object pass
 *     through untouched — the only sanctioned around-dispatch use.
 *   - `llm/stream` (waterfall): wraps the AsyncIterable to count chunks and
 *     time the stream. Chunks are yielded verbatim; loop-built requests are
 *     deep-frozen and only ever read (dsh's own constraint).
 *
 * All recording is failure-contained: an observing bug must never break the
 * business call it watches.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { ObserveSnapshot, ObserveStats } from '../types.ts';
export type * from '../types.ts';
/**
 * Remote-exposed observability gateway; the class itself is the plugin.
 *
 * Intentionally injects NO service: the gateway only subscribes to the
 * `tools/execute` and `llm/stream` waterfalls via `ctx.on(...)`, which does
 * not require the `tools`/`llm` services to be injected (and would otherwise
 * park this plugin in `pending` on host profiles where those agent-plane
 * services are not yet active — which would block `remote.observe` from
 * registering and break every client that injects it).
 */
export declare class ObserveGateway extends TypertRemoteService {
    private readonly store;
    private config;
    constructor(ctx: Context);
    /** Apply the currently resolved config to the store and capture switches. */
    private applyConfig;
    /** Around-dispatch timing. Never touches exec.signal or the result. */
    private readonly onToolExecute;
    /** Stream wrapping. Chunks pass through verbatim; only counted. */
    private readonly onLlmStream;
    private wrapLlmStream;
    /** Failure-contained event recording: observation must never break calls. */
    private recordTool;
    private recordLlm;
    /** Newest-first observation window plus aggregate counters. */
    snapshot(): ObserveSnapshot;
    /** Aggregate counters only (cheap polling variant). */
    stats(): ObserveStats;
    /** Reset the ring buffer (debug / session-boundary use). */
    clear(): void;
}
export default ObserveGateway;
//# sourceMappingURL=index.d.ts.map