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
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import Schema from '@deepseek-ai/schemastery';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
import { ObserveStore } from "./store.js";
/** The `ai-bridge-observe` user-settings namespace (M4 hot-reload seam). */
const NS = settingsNamespace('ai-bridge-observe');
/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG = { maxEvents: 2_000, captureTools: true, captureLlm: true };
/** Resolved-value schema for the observe settings section. */
const Config = Schema.object({
    maxEvents: Schema.number().min(1).default(2_000),
    captureTools: Schema.boolean().default(true),
    captureLlm: Schema.boolean().default(true),
});
/** Best-effort caller-agent key extraction (Agent shape is scope-defined). */
function agentKeyOf(agent) {
    if (agent == null)
        return undefined;
    if (typeof agent === 'string')
        return agent.length > 0 ? agent : undefined;
    if (typeof agent === 'object') {
        const record = agent;
        for (const key of ['key', 'id', 'name']) {
            const value = record[key];
            if (typeof value === 'string' && value.length > 0)
                return value;
        }
    }
    return undefined;
}
/** Classify a normalized tool result without depending on its exact variant. */
function outcomeOfResult(result) {
    if (result && typeof result === 'object') {
        const record = result;
        if (record.ok === false)
            return 'error';
        if (typeof record.kind === 'string' && /fail|error/i.test(record.kind))
            return 'error';
        if ('error' in record && record.error != null)
            return 'error';
    }
    return 'success';
}
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
let ObserveGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _snapshot_decorators;
    let _stats_decorators;
    let _clear_decorators;
    return class ObserveGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _snapshot_decorators = [Remote('snapshot')];
            _stats_decorators = [Remote('stats')];
            _clear_decorators = [Remote('clear')];
            __esDecorate(this, null, _snapshot_decorators, { kind: "method", name: "snapshot", static: false, private: false, access: { has: obj => "snapshot" in obj, get: obj => obj.snapshot }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _stats_decorators, { kind: "method", name: "stats", static: false, private: false, access: { has: obj => "stats" in obj, get: obj => obj.stats }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _clear_decorators, { kind: "method", name: "clear", static: false, private: false, access: { has: obj => "clear" in obj, get: obj => obj.clear }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        store = (__runInitializers(this, _instanceExtraInitializers), new ObserveStore());
        config = DEFAULT_CONFIG;
        constructor(ctx) {
            super(ctx, 'observe');
            ctx.on('tools/execute', this.onToolExecute);
            ctx.on('llm/stream', this.onLlmStream);
            // M4: the `ai-bridge-observe` user-settings section hot-reloads capacity
            // and the capture switches (the same seam the P2 router will reuse).
            installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
                setSource: (source) => {
                    this.config = source();
                    this.applyConfig();
                },
                onChange: () => {
                    this.applyConfig();
                },
            });
        }
        /** Apply the currently resolved config to the store and capture switches. */
        applyConfig() {
            this.store.setMaxEvents(this.config.maxEvents);
        }
        /** Around-dispatch timing. Never touches exec.signal or the result. */
        onToolExecute = async (exec, next) => {
            const startedAt = Date.now();
            try {
                const result = await next();
                if (this.config.captureTools)
                    this.recordTool(exec, startedAt, outcomeOfResult(result));
                return result;
            }
            catch (error) {
                if (this.config.captureTools)
                    this.recordTool(exec, startedAt, 'error');
                throw error;
            }
        };
        /** Stream wrapping. Chunks pass through verbatim; only counted. */
        onLlmStream = (options, next) => {
            const startedAt = Date.now();
            let inner;
            try {
                inner = next();
            }
            catch (error) {
                if (this.config.captureLlm)
                    this.recordLlm(options, startedAt, 0, 'error');
                throw error;
            }
            return this.wrapLlmStream(options, startedAt, inner);
        };
        async *wrapLlmStream(options, startedAt, inner) {
            let chunks = 0;
            try {
                for await (const chunk of inner) {
                    chunks += 1;
                    yield chunk;
                }
                if (this.config.captureLlm)
                    this.recordLlm(options, startedAt, chunks, 'success');
            }
            catch (error) {
                if (this.config.captureLlm)
                    this.recordLlm(options, startedAt, chunks, 'error');
                throw error;
            }
        }
        /** Failure-contained event recording: observation must never break calls. */
        recordTool(exec, startedAt, outcome) {
            try {
                const name = typeof exec.name === 'string' && exec.name.length > 0 ? exec.name : 'unknown';
                this.store.push({
                    id: this.store.nextId(),
                    kind: 'tool.call',
                    name,
                    ...(agentKeyOf(exec.agent) ? { agent: agentKeyOf(exec.agent) } : {}),
                    startedAt: new Date(startedAt).toISOString(),
                    durationMs: Date.now() - startedAt,
                    outcome,
                    source: name.startsWith('mcp__') ? 'mcp' : 'builtin',
                });
            }
            catch {
                // contained by design
            }
        }
        recordLlm(options, startedAt, chunks, outcome) {
            try {
                const provider = typeof options.provider === 'string' ? options.provider : 'unknown';
                const model = typeof options.model === 'string' ? options.model : 'unknown';
                this.store.push({
                    id: this.store.nextId(),
                    kind: 'llm.stream',
                    name: `${provider}/${model}`,
                    startedAt: new Date(startedAt).toISOString(),
                    durationMs: Date.now() - startedAt,
                    outcome,
                    source: 'builtin',
                    features: { chunks },
                });
            }
            catch {
                // contained by design
            }
        }
        /** Newest-first observation window plus aggregate counters. */
        snapshot() {
            return this.store.snapshot();
        }
        /** Aggregate counters only (cheap polling variant). */
        stats() {
            return this.store.stats();
        }
        /** Reset the ring buffer (debug / session-boundary use). */
        clear() {
            this.store.clear();
        }
    };
})();
export { ObserveGateway };
export default ObserveGateway;
//# sourceMappingURL=index.js.map