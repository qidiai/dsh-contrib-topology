import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/engine.js
/**
* Orchestration engine — pure control-flow, no I/O.
*
* Ported from the ai-bridge MultiAgentDispatcher: five dispatch modes
* (parallel / sequential / select / cascade / merge) plus per-agent retry.
* Execution is injected as a callback so the host can bind it to
* `ctx.subagents.start()` (the harness's native delegation seam).
*/
const DEFAULT_LIMIT = 3;
const DEFAULT_RETRY = 0;
/**
* Permanent failures that retrying cannot fix — skip retries for these error
* classes (they would only repeat the same outcome and burn latency).
*/
const PERMANENT_ERROR_MARKERS = [
	"parent agent unavailable",
	"no subagent provider registered",
	"skipped after select winner",
	"subagents service unavailable"
];
function isRetryable(error) {
	if (error === void 0 || error.length === 0) return true;
	return !PERMANENT_ERROR_MARKERS.some((marker) => error.includes(marker));
}
/** Run one agent with retries; permanent errors are not retried. */
async function runWithRetry(agent, task, run, retryCount) {
	let last = {
		ok: false,
		durationMs: 0,
		error: "no attempt"
	};
	for (let attempt = 0; attempt <= retryCount; attempt += 1) {
		last = await run(agent, task);
		if (last.ok) break;
		if (!isRetryable(last.error)) break;
	}
	return {
		agent,
		...last
	};
}
/** Run every agent with a dynamic concurrency window (shrink on failures). */
async function runAll(agents, task, run, options) {
	const runs = [];
	let currentLimit = Math.max(1, options.parallelLimit);
	for (let i = 0; i < agents.length; i += currentLimit) {
		const batch = agents.slice(i, i + currentLimit);
		const settled = await Promise.all(batch.map((agent) => runWithRetry(agent, task, run, options.retryCount)));
		runs.push(...settled);
		const failures = settled.filter((r) => !r.ok).length;
		if (failures > 0 && failures / settled.length >= .5) currentLimit = Math.max(1, Math.floor(currentLimit / 2));
		else if (failures === 0) currentLimit = Math.min(options.parallelLimit, currentLimit + 1);
	}
	return runs;
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
async function orchestrate(request, run, options = {
	parallelLimit: DEFAULT_LIMIT,
	retryCount: DEFAULT_RETRY
}) {
	const mode = request.mode ?? "parallel";
	const agents = request.agents && request.agents.length > 0 ? [...request.agents] : [];
	const startedAt = (/* @__PURE__ */ new Date()).toISOString();
	const startedMs = Date.now();
	let runs = [];
	let winner;
	let mergedSummary;
	if (agents.length === 0) runs = [];
	else if (mode === "parallel") {
		runs = await runAll(agents, request.task, run, options);
		winner = runs.find((r) => r.ok)?.agent;
	} else if (mode === "merge") {
		runs = await runAll(agents, request.task, run, options);
		winner = runs.find((r) => r.ok)?.agent;
		const merged = runs.filter((r) => r.ok && r.output !== void 0 && r.output.length > 0).map((r) => `[${r.agent}] ${r.output}`).join("\n");
		if (merged.length > 0) mergedSummary = merged;
	} else if (mode === "sequential" || mode === "cascade") {
		const accumulated = [];
		for (const agent of agents) {
			const attempt = await runWithRetry(agent, request.task, run, options.retryCount);
			accumulated.push(attempt);
			if (attempt.ok) {
				winner = agent;
				break;
			}
		}
		runs = accumulated;
	} else if (mode === "select") {
		const [first, ...rest] = agents;
		const attempt = await runWithRetry(first, request.task, run, options.retryCount);
		runs = [attempt, ...attempt.ok ? [] : rest.map((agent) => ({
			agent,
			ok: false,
			durationMs: 0,
			error: "skipped after select winner"
		}))];
		winner = attempt.ok ? first : void 0;
	}
	return {
		task: request.task,
		mode,
		runs,
		...winner === void 0 ? {} : { winner },
		...mergedSummary === void 0 ? {} : { merged: mergedSummary },
		allOk: runs.length > 0 && runs.every((r) => r.ok),
		startedAt,
		durationMs: Date.now() - startedMs
	};
}
//#endregion
//#region lib/types/host/index.js
/**
* Host-side orchestrator gateway.
*
* Exposes the orchestration engine (five dispatch modes, ported from
* ai-bridge's MultiAgentDispatcher) as Typert Remotes. The execution seam
* binds the engine's injected callback to `ctx.subagents.start()` — the
* harness's native delegation — and every run is echoed through
* `subagent/start`/`subagent/end` listeners so observe/router see it too.
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
/** Keep the most recent N dispatch history entries. */
const MAX_HISTORY = 50;
/** Flatten a subagent run result into its final text output (best-effort). */
function extractTextOutput(run) {
	try {
		if (run === void 0 || run === null || typeof run !== "object") return void 0;
		const output = run.output;
		if (!Array.isArray(output)) return void 0;
		const parts = [];
		for (const block of output) if (block && typeof block === "object") {
			const b = block;
			if (b.type === "text" && typeof b.text === "string" && b.text.length > 0) parts.push(b.text);
		}
		return parts.length > 0 ? parts.join("\n") : void 0;
	} catch {
		return;
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
			_dispatch_decorators = [Remote("dispatch")];
			_stats_decorators = [Remote("stats")];
			_snapshot_decorators = [Remote("snapshot")];
			_probe_decorators = [Remote("probe")];
			__esDecorate(this, null, _dispatch_decorators, {
				kind: "method",
				name: "dispatch",
				static: false,
				private: false,
				access: {
					has: (obj) => "dispatch" in obj,
					get: (obj) => obj.dispatch
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
			__esDecorate(this, null, _probe_decorators, {
				kind: "method",
				name: "probe",
				static: false,
				private: false,
				access: {
					has: (obj) => "probe" in obj,
					get: (obj) => obj.probe
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
		dispatches = (__runInitializers(this, _instanceExtraInitializers), 0);
		runs = 0;
		successes = 0;
		failures = 0;
		byMode = {};
		history = [];
		constructor(ctx) {
			super(ctx, "orchestrator");
			ctx.on("subagent/start", this.onStart);
			ctx.on("subagent/end", this.onEnd);
		}
		onStart = (info) => {};
		onEnd = (info) => {};
		/** Execute one dispatch through the native subagent seam. */
		async dispatch(request) {
			const startedAt = (/* @__PURE__ */ new Date()).toISOString();
			const mode = request.mode ?? "parallel";
			let effective = request;
			let rankEvidence;
			if ((mode === "select" || mode === "sequential" || mode === "cascade") && request.agents !== void 0 && request.agents.length > 1) try {
				const router = this.ctx.get("router");
				if (router?.rank !== void 0) {
					const ranked = await router.rank(request.task, request.agents);
					const ordered = ranked.ranked.map((entry) => entry.name);
					if (ordered.length > 0) {
						effective = {
							...request,
							agents: ordered
						};
						rankEvidence = ranked.ranked.map((entry) => ({
							agent: entry.name,
							score: entry.score,
							reason: entry.reason,
							coolingDown: entry.profile.coolingDown
						}));
					}
				}
			} catch {}
			const result = await orchestrate(effective, async (agent, task) => {
				this.runs += 1;
				const started = Date.now();
				try {
					const subagents = this.ctx.get("subagents");
					if (subagents === void 0) {
						this.failures += 1;
						return {
							ok: false,
							durationMs: Date.now() - started,
							error: "subagents service unavailable"
						};
					}
					const agents = this.ctx.get("agents");
					const parent = request.parentSessionId !== void 0 ? agents?.get?.(request.parentSessionId) : agents?.currentInitiator?.();
					if (parent === void 0) {
						this.failures += 1;
						return {
							ok: false,
							durationMs: Date.now() - started,
							error: "parent agent unavailable: dispatch needs a live session (pass parentSessionId) or an initiator boundary"
						};
					}
					const run = await subagents.start(agent, {
						prompt: [{
							type: "text",
							text: task
						}],
						parent,
						label: "orchestrator",
						signal: new AbortController().signal
					});
					const ok = run !== void 0 && typeof run === "object";
					if (ok) this.successes += 1;
					else this.failures += 1;
					const output = extractTextOutput(run);
					return {
						ok,
						durationMs: Date.now() - started,
						...output === void 0 ? {} : { output }
					};
				} catch (error) {
					this.failures += 1;
					return {
						ok: false,
						durationMs: Date.now() - started,
						error: error instanceof Error ? error.message : String(error)
					};
				}
			}, {
				parallelLimit: request.parallelLimit ?? 3,
				retryCount: request.retryCount ?? 0
			});
			this.dispatches += 1;
			this.byMode[mode] = (this.byMode[mode] ?? 0) + 1;
			this.history.unshift({
				startedAt,
				task: result.task,
				mode: result.mode,
				...result.winner === void 0 ? {} : { winner: result.winner },
				allOk: result.allOk,
				durationMs: result.durationMs
			});
			if (this.history.length > MAX_HISTORY) this.history.length = MAX_HISTORY;
			return {
				...result,
				...rankEvidence === void 0 ? {} : { ranked: rankEvidence }
			};
		}
		/** Aggregate dispatch counters. */
		stats() {
			return {
				dispatches: this.dispatches,
				runs: this.runs,
				successes: this.successes,
				failures: this.failures,
				byMode: { ...this.byMode }
			};
		}
		/** Recent dispatch history plus counters (cheap polling view). */
		snapshot() {
			return {
				stats: this.stats(),
				history: [...this.history],
				capturedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
		/** Diagnostic: service visibility on this context (agents/subagents realm probe). */
		probe() {
			const agents = this.ctx.get("agents");
			let hasInitiator = false;
			try {
				hasInitiator = agents?.currentInitiator?.() !== void 0;
			} catch {}
			return {
				agents: agents === void 0 ? "undefined" : typeof agents,
				subagents: this.ctx.get("subagents") === void 0 ? "undefined" : typeof this.ctx.get("subagents"),
				hasInitiator
			};
		}
	};
})();
//#endregion
export { OrchestratorGateway, OrchestratorGateway as default };
