/**
 * Host-side orchestrator gateway.
 *
 * Exposes the orchestration engine (five dispatch modes, ported from
 * ai-bridge's MultiAgentDispatcher) as Typert Remotes. The execution seam
 * binds the engine's injected callback to `ctx.subagents.start()` — the
 * harness's native delegation — and every run is echoed through
 * `subagent/start`/`subagent/end` listeners so observe/router see it too.
 */
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
import { orchestrate } from "../engine.js";
/** Keep the most recent N dispatch history entries. */
const MAX_HISTORY = 50;
/** Flatten a subagent run result into its final text output (best-effort). */
function extractTextOutput(run) {
    try {
        if (run === undefined || run === null || typeof run !== 'object')
            return undefined;
        const record = run;
        const output = record.output;
        if (!Array.isArray(output))
            return undefined;
        const parts = [];
        for (const block of output) {
            if (block && typeof block === 'object') {
                const b = block;
                if (b.type === 'text' && typeof b.text === 'string' && b.text.length > 0) {
                    parts.push(b.text);
                }
            }
        }
        return parts.length > 0 ? parts.join('\n') : undefined;
    }
    catch {
        // contained by design
        return undefined;
    }
}
/** Remote-only service exposing live orchestration. */
let OrchestratorGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _dispatch_decorators;
    let _stats_decorators;
    let _snapshot_decorators;
    let _probe_decorators;
    return class OrchestratorGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _dispatch_decorators = [Remote('dispatch')];
            _stats_decorators = [Remote('stats')];
            _snapshot_decorators = [Remote('snapshot')];
            _probe_decorators = [Remote('probe')];
            __esDecorate(this, null, _dispatch_decorators, { kind: "method", name: "dispatch", static: false, private: false, access: { has: obj => "dispatch" in obj, get: obj => obj.dispatch }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _stats_decorators, { kind: "method", name: "stats", static: false, private: false, access: { has: obj => "stats" in obj, get: obj => obj.stats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _snapshot_decorators, { kind: "method", name: "snapshot", static: false, private: false, access: { has: obj => "snapshot" in obj, get: obj => obj.snapshot }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _probe_decorators, { kind: "method", name: "probe", static: false, private: false, access: { has: obj => "probe" in obj, get: obj => obj.probe }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        dispatches = (__runInitializers(this, _instanceExtraInitializers), 0);
        runs = 0;
        successes = 0;
        failures = 0;
        byMode = {};
        history = [];
        constructor(ctx) {
            super(ctx, 'orchestrator');
            ctx.on('subagent/start', this.onStart);
            ctx.on('subagent/end', this.onEnd);
        }
        onStart = (info) => {
            // Orchestrated runs are counted via run completion; this listener exists
            // so the run is visible to observe/router and to track start timestamps.
            void info;
        };
        onEnd = (info) => {
            void info;
        };
        /** Execute one dispatch through the native subagent seam. */
        async dispatch(request) {
            const startedAt = new Date().toISOString();
            const mode = request.mode ?? 'parallel';
            // Ordered-attempt seam (select / sequential / cascade): reorder the
            // candidates by the router's Bayesian rank (best first) before delegating;
            // falls back to the caller's order when the router service is unavailable
            // or ranking fails. The rank evidence is carried into the result for
            // decision transparency in every ordered mode.
            let effective = request;
            let rankEvidence;
            const orderedModes = mode === 'select' || mode === 'sequential' || mode === 'cascade';
            if (orderedModes && request.agents !== undefined && request.agents.length > 1) {
                try {
                    const router = this.ctx.get('router');
                    if (router?.rank !== undefined) {
                        const ranked = await router.rank(request.task, request.agents);
                        const ordered = ranked.ranked.map((entry) => entry.name);
                        if (ordered.length > 0) {
                            effective = { ...request, agents: ordered };
                            rankEvidence = ranked.ranked.map((entry) => ({
                                agent: entry.name,
                                score: entry.score,
                                reason: entry.reason,
                                coolingDown: entry.profile.coolingDown,
                            }));
                        }
                    }
                }
                catch {
                    // contained: a ranking failure must never break the dispatch
                }
            }
            const result = await orchestrate(effective, async (agent, task) => {
                this.runs += 1;
                const started = Date.now();
                try {
                    const subagents = this.ctx.get('subagents');
                    if (subagents === undefined) {
                        this.failures += 1;
                        return { ok: false, durationMs: Date.now() - started, error: 'subagents service unavailable' };
                    }
                    // SubagentRuntime.start(name, request): the provider is the FIRST
                    // positional arg, not a field of the request; `signal` is required.
                    // parent resolves from the requested session's live agent, falling
                    // back to the current initiator when no session id was supplied.
                    // When neither yields an Agent (e.g. a Remote-triggered dispatch
                    // outside any initiator boundary), fail with a clear error instead of
                    // letting the provider crash on `parent.options`.
                    const agents = this.ctx.get('agents');
                    const parent = request.parentSessionId !== undefined
                        ? agents?.get?.(request.parentSessionId)
                        : agents?.currentInitiator?.();
                    if (parent === undefined) {
                        this.failures += 1;
                        return {
                            ok: false,
                            durationMs: Date.now() - started,
                            error: 'parent agent unavailable: dispatch needs a live session (pass parentSessionId) or an initiator boundary',
                        };
                    }
                    const run = await subagents.start(agent, {
                        prompt: [{ type: 'text', text: task }],
                        parent: parent,
                        label: 'orchestrator',
                        signal: new AbortController().signal,
                    });
                    const ok = run !== undefined && typeof run === 'object';
                    if (ok)
                        this.successes += 1;
                    else
                        this.failures += 1;
                    // Extract the delegated child's final text output for merge mode.
                    const output = extractTextOutput(run);
                    return { ok, durationMs: Date.now() - started, ...(output === undefined ? {} : { output }) };
                }
                catch (error) {
                    this.failures += 1;
                    return { ok: false, durationMs: Date.now() - started, error: error instanceof Error ? error.message : String(error) };
                }
            }, {
                parallelLimit: request.parallelLimit ?? 3,
                retryCount: request.retryCount ?? 0,
            });
            this.dispatches += 1;
            this.byMode[mode] = (this.byMode[mode] ?? 0) + 1;
            this.history.unshift({
                startedAt,
                task: result.task,
                mode: result.mode,
                ...(result.winner === undefined ? {} : { winner: result.winner }),
                allOk: result.allOk,
                durationMs: result.durationMs,
            });
            if (this.history.length > MAX_HISTORY)
                this.history.length = MAX_HISTORY;
            return { ...result, ...(rankEvidence === undefined ? {} : { ranked: rankEvidence }) };
        }
        /** Aggregate dispatch counters. */
        stats() {
            return {
                dispatches: this.dispatches,
                runs: this.runs,
                successes: this.successes,
                failures: this.failures,
                byMode: { ...this.byMode },
            };
        }
        /** Recent dispatch history plus counters (cheap polling view). */
        snapshot() {
            return {
                stats: this.stats(),
                history: [...this.history],
                capturedAt: new Date().toISOString(),
            };
        }
        /** Diagnostic: service visibility on this context (agents/subagents realm probe). */
        probe() {
            const agents = this.ctx.get('agents');
            let hasInitiator = false;
            try {
                hasInitiator = agents?.currentInitiator?.() !== undefined;
            }
            catch { /* contained */ }
            return {
                agents: agents === undefined ? 'undefined' : typeof agents,
                subagents: this.ctx.get('subagents') === undefined ? 'undefined' : typeof this.ctx.get('subagents'),
                hasInitiator,
            };
        }
    };
})();
export { OrchestratorGateway };
export default OrchestratorGateway;
//# sourceMappingURL=index.js.map