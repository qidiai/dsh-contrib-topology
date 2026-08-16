import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import Schema from "@deepseek-ai/schemastery";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/host/store.js
/**
* In-memory ring buffer for observed events.
*
* Deliberately queryable (by kind / agent / since) rather than a bare array:
* the P2 router reads training windows through the same accessors, so the
* store API is part of the suite's long-lived contract, not an internal
* detail. M1 keeps everything in memory; M4 adds optional persistence for
* cross-session training data.
*/
var ObserveStore = class {
	events = [];
	dropped = 0;
	seq = 0;
	maxEvents;
	constructor(maxEvents = 2e3) {
		this.maxEvents = maxEvents;
	}
	/** Allocate a stable, monotonically increasing event id. */
	nextId() {
		this.seq += 1;
		return `obs-${this.seq}`;
	}
	/** M4: retune the ring-buffer capacity live (via the settings seam). */
	setMaxEvents(value) {
		const next = Number.isFinite(value) && value > 0 ? Math.floor(value) : this.maxEvents;
		if (next === this.maxEvents) return;
		this.maxEvents = next;
		while (this.events.length > this.maxEvents) {
			this.events.shift();
			this.dropped += 1;
		}
	}
	push(event) {
		if (this.events.length >= this.maxEvents) {
			this.events.shift();
			this.dropped += 1;
		}
		this.events.push(event);
	}
	/** Newest-first window for the UI timeline and future router queries. */
	query(filter = {}) {
		let out = this.events;
		if (filter.kind) out = out.filter((e) => e.kind === filter.kind);
		if (filter.agent) out = out.filter((e) => e.agent === filter.agent);
		if (filter.since) out = out.filter((e) => e.startedAt >= filter.since);
		out = [...out].reverse();
		return filter.limit ? out.slice(0, filter.limit) : out;
	}
	stats() {
		let toolCalls = 0;
		let llmStreams = 0;
		let errorCount = 0;
		const toolByName = /* @__PURE__ */ new Map();
		const modelByName = /* @__PURE__ */ new Map();
		for (const e of this.events) {
			if (e.kind === "tool.call") {
				toolCalls += 1;
				const bucket = toolByName.get(e.name) ?? {
					calls: 0,
					errors: 0,
					durations: []
				};
				bucket.calls += 1;
				if (e.outcome !== "success") bucket.errors += 1;
				if (e.durationMs !== void 0) bucket.durations.push(e.durationMs);
				toolByName.set(e.name, bucket);
			} else if (e.kind === "llm.stream") {
				llmStreams += 1;
				const bucket = modelByName.get(e.name) ?? {
					streams: 0,
					totalChunks: 0,
					durations: []
				};
				bucket.streams += 1;
				if (typeof e.features?.chunks === "number") bucket.totalChunks += e.features.chunks;
				if (e.durationMs !== void 0) bucket.durations.push(e.durationMs);
				modelByName.set(e.name, bucket);
			}
			if (e.outcome !== "success") errorCount += 1;
		}
		const avg = (durations) => durations.length === 0 ? 0 : Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
		const topTools = [...toolByName.entries()].map(([name, b]) => ({
			name,
			calls: b.calls,
			errors: b.errors,
			errorRate: b.calls === 0 ? 0 : b.errors / b.calls
		})).sort((a, b) => b.calls - a.calls).slice(0, 8);
		const topModels = [...modelByName.entries()].map(([name, b]) => ({
			name,
			streams: b.streams,
			avgDurationMs: avg(b.durations),
			totalChunks: b.totalChunks
		})).sort((a, b) => b.streams - a.streams).slice(0, 8);
		return {
			totalEvents: this.events.length,
			toolCalls,
			llmStreams,
			errorCount,
			droppedCount: this.dropped,
			errorRate: this.events.length === 0 ? 0 : errorCount / this.events.length,
			topTools,
			topModels
		};
	}
	snapshot() {
		return {
			events: this.query({ limit: 200 }),
			stats: this.stats(),
			capturedAt: (/* @__PURE__ */ new Date()).toISOString()
		};
	}
	clear() {
		this.events = [];
		this.dropped = 0;
	}
};
//#endregion
//#region lib/types/host/index.js
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
var __runInitializers = function(thisArg, initializers, value) {
	var useValue = arguments.length > 2;
	for (var i = 0; i < initializers.length; i++) value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
	return useValue ? value : void 0;
};
var __esDecorate = function(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
	function accept(f) {
		if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
		return f;
	}
	var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
	var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
	var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
	var _, done = false;
	for (var i = decorators.length - 1; i >= 0; i--) {
		var context = {};
		for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
		for (var p in contextIn.access) context.access[p] = contextIn.access[p];
		context.addInitializer = function(f) {
			if (done) throw new TypeError("Cannot add initializers after decoration has completed");
			extraInitializers.push(accept(f || null));
		};
		var result = (0, decorators[i])(kind === "accessor" ? {
			get: descriptor.get,
			set: descriptor.set
		} : descriptor[key], context);
		if (kind === "accessor") {
			if (result === void 0) continue;
			if (result === null || typeof result !== "object") throw new TypeError("Object expected");
			if (_ = accept(result.get)) descriptor.get = _;
			if (_ = accept(result.set)) descriptor.set = _;
			if (_ = accept(result.init)) initializers.unshift(_);
		} else if (_ = accept(result)) if (kind === "field") initializers.unshift(_);
		else descriptor[key] = _;
	}
	if (target) Object.defineProperty(target, contextIn.name, descriptor);
	done = true;
};
/** The `ai-bridge-observe` user-settings namespace (M4 hot-reload seam). */
const NS = settingsNamespace("ai-bridge-observe");
/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG = {
	maxEvents: 2e3,
	captureTools: true,
	captureLlm: true
};
/** Resolved-value schema for the observe settings section. */
const Config = Schema.object({
	maxEvents: Schema.number().min(1).default(2e3),
	captureTools: Schema.boolean().default(true),
	captureLlm: Schema.boolean().default(true)
});
/** Best-effort caller-agent key extraction (Agent shape is scope-defined). */
function agentKeyOf(agent) {
	if (agent == null) return void 0;
	if (typeof agent === "string") return agent.length > 0 ? agent : void 0;
	if (typeof agent === "object") {
		const record = agent;
		for (const key of [
			"key",
			"id",
			"name"
		]) {
			const value = record[key];
			if (typeof value === "string" && value.length > 0) return value;
		}
	}
}
/** Classify a normalized tool result without depending on its exact variant. */
function outcomeOfResult(result) {
	if (result && typeof result === "object") {
		const record = result;
		if (record.ok === false) return "error";
		if (typeof record.kind === "string" && /fail|error/i.test(record.kind)) return "error";
		if ("error" in record && record.error != null) return "error";
	}
	return "success";
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
			_snapshot_decorators = [Remote("snapshot")];
			_stats_decorators = [Remote("stats")];
			_clear_decorators = [Remote("clear")];
			__esDecorate(this, null, _snapshot_decorators, {
				kind: "method",
				name: "snapshot",
				static: false,
				private: false,
				access: {
					has: (obj) => "snapshot" in obj,
					get: (obj) => obj.snapshot
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _stats_decorators, {
				kind: "method",
				name: "stats",
				static: false,
				private: false,
				access: {
					has: (obj) => "stats" in obj,
					get: (obj) => obj.stats
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _clear_decorators, {
				kind: "method",
				name: "clear",
				static: false,
				private: false,
				access: {
					has: (obj) => "clear" in obj,
					get: (obj) => obj.clear
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			if (_metadata) Object.defineProperty(this, Symbol.metadata, {
				enumerable: true,
				configurable: true,
				writable: true,
				value: _metadata
			});
		}
		store = (__runInitializers(this, _instanceExtraInitializers), new ObserveStore());
		config = DEFAULT_CONFIG;
		/** Delegation start timestamps, keyed by subagent run id (paired start/end). */
		runStarts = /* @__PURE__ */ new Map();
		constructor(ctx) {
			super(ctx, "observe");
			ctx.on("tools/execute", this.onToolExecute);
			ctx.on("llm/stream", this.onLlmStream);
			ctx.on("subagent/start", this.onSubagentStart);
			ctx.on("subagent/end", this.onSubagentEnd);
			installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
				setSource: (source) => {
					this.config = source();
					this.applyConfig();
				},
				onChange: () => {
					this.applyConfig();
				}
			});
		}
		/** Apply the currently resolved config to the store and capture switches. */
		applyConfig() {
			this.store.setMaxEvents(this.config.maxEvents);
		}
		/** Record the start timestamp for a delegation, keyed by run id. */
		onSubagentStart = (info) => {
			this.runStarts.set(info.runId, Date.now());
		};
		/** Append the delegation outcome to the event timeline (P2 dispatch kind). */
		onSubagentEnd = (info) => {
			const startedAt = this.runStarts.get(info.runId);
			this.runStarts.delete(info.runId);
			if (!this.config.captureTools && !this.config.captureLlm) return;
			try {
				const outcome = info.stopReason === "completed" ? "success" : "error";
				this.store.push({
					id: this.store.nextId(),
					kind: "subagent.dispatch",
					name: info.provider,
					...agentKeyOf(info.id) ? { agent: agentKeyOf(info.id) } : {},
					startedAt: new Date(startedAt ?? Date.now()).toISOString(),
					...startedAt === void 0 ? {} : { durationMs: Date.now() - startedAt },
					outcome,
					source: "builtin",
					features: {
						local: info.local,
						stopReason: info.stopReason
					}
				});
			} catch {}
		};
		/** Around-dispatch timing. Never touches exec.signal or the result. */
		onToolExecute = async (exec, next) => {
			const startedAt = Date.now();
			try {
				const result = await next();
				if (this.config.captureTools) this.recordTool(exec, startedAt, outcomeOfResult(result));
				return result;
			} catch (error) {
				if (this.config.captureTools) this.recordTool(exec, startedAt, "error");
				throw error;
			}
		};
		/** Stream wrapping. Chunks pass through verbatim; only counted. */
		onLlmStream = (options, next) => {
			const startedAt = Date.now();
			let inner;
			try {
				inner = next();
			} catch (error) {
				if (this.config.captureLlm) this.recordLlm(options, startedAt, 0, "error");
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
				if (this.config.captureLlm) this.recordLlm(options, startedAt, chunks, "success");
			} catch (error) {
				if (this.config.captureLlm) this.recordLlm(options, startedAt, chunks, "error");
				throw error;
			}
		}
		/** Failure-contained event recording: observation must never break calls. */
		recordTool(exec, startedAt, outcome) {
			try {
				const name = typeof exec.name === "string" && exec.name.length > 0 ? exec.name : "unknown";
				this.store.push({
					id: this.store.nextId(),
					kind: "tool.call",
					name,
					...agentKeyOf(exec.agent) ? { agent: agentKeyOf(exec.agent) } : {},
					startedAt: new Date(startedAt).toISOString(),
					durationMs: Date.now() - startedAt,
					outcome,
					source: name.startsWith("mcp__") ? "mcp" : "builtin"
				});
			} catch {}
		}
		recordLlm(options, startedAt, chunks, outcome) {
			try {
				const provider = typeof options.provider === "string" ? options.provider : "unknown";
				const model = typeof options.model === "string" ? options.model : "unknown";
				this.store.push({
					id: this.store.nextId(),
					kind: "llm.stream",
					name: `${provider}/${model}`,
					startedAt: new Date(startedAt).toISOString(),
					durationMs: Date.now() - startedAt,
					outcome,
					source: "builtin",
					features: { chunks }
				});
			} catch {}
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
//#endregion
export { ObserveGateway, ObserveGateway as default };
