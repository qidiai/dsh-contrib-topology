import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/routing.js
/**
* Router scoring core — pure functions, no I/O.
*
* Ported from the ai-bridge `routing-score.js` (7-dimension explainable
* Bayesian routing): success, capability, latency, token cost, freshness,
* stability, confidence. Only signals the system actually has are used:
* run outcomes, durations, token usage, recency. "Cost" is average token
* consumption, not a currency conversion.
*/
const DAY_MS = 1440 * 60 * 1e3;
const DEFAULT_WEIGHTS = Object.freeze({
	success: .3,
	capability: .2,
	latency: .15,
	tokenCost: .1,
	freshness: .1,
	stability: .1,
	confidence: .05
});
function clamp01(value) {
	return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}
function parseDurationMs(value) {
	if (typeof value === "number") return Number.isFinite(value) ? Math.max(0, value) : null;
	if (typeof value !== "string") return null;
	const match = value.trim().toLowerCase().match(/^([0-9]+(?:\.[0-9]+)?)\s*(ms|s|sec|secs|second|seconds)?$/);
	if (!match) return null;
	const n = Number(match[1]);
	return match[2] === "ms" ? n : n * 1e3;
}
/** Classify a task description into a coarse category for capability scoring. */
function classifyTask(task) {
	const text = String(task || "").toLowerCase();
	if (/(review|审查|评审|检查代码|code review|安全审计|audit|pr\b|pull request)/i.test(text)) return "review";
	if (/(写|实现|修复|重构|函数|代码|python|javascript|typescript|node|java|go\b|rust|sql|bug|test|测试用例|接口|api|脚本|implement|fix|refactor|write|code|function|script|build)/i.test(text)) return "code";
	if (/(分析|比较|调研|研究|原因|诊断|评估|方案|架构|设计|analy|investigat|debug|diagnos|root cause|why|compare|research|evaluate|design|architect|leak)/i.test(text)) return "analysis";
	if (/(文档|报告|说明|总结|readme|release note|教程|doc|summar|explain|tutorial)/i.test(text)) return "docs";
	if (/(部署|启动|停止|进程|服务|日志|运维|环境|配置|docker|server|deploy|restart|stop|start|monitor|container|kubernetes|process|log)/i.test(text)) return "ops";
	return "general";
}
function decayWeight(ts, now, halfLifeDays = 14) {
	const time = Date.parse(ts);
	if (!Number.isFinite(time)) return .5;
	const age = Math.max(0, now - time);
	return Math.pow(.5, age / (Math.max(1, halfLifeDays) * DAY_MS));
}
function bayesianRate(successes, calls, priorMean = .5, priorStrength = 4) {
	return (successes + priorMean * priorStrength) / (calls + priorStrength);
}
function wilsonLowerBound(successes, calls, z = 1.28) {
	if (calls <= 0) return .5;
	const p = successes / calls;
	const z2 = z * z;
	const denom = 1 + z2 / calls;
	return clamp01((p + z2 / (2 * calls) - z * Math.sqrt((p * (1 - p) + z2 / (4 * calls)) / calls)) / denom);
}
function average(values) {
	const valid = values.filter(Number.isFinite);
	return valid.length ? valid.reduce((sum, v) => sum + v, 0) / valid.length : null;
}
/** Build a provider's routing profile from its observation history. */
function buildRoutingProfile(tool, observations, tokenSummary = {}, now = Date.now()) {
	const rows = observations.filter(Boolean);
	let weightedCalls = 0;
	let weightedSuccesses = 0;
	const categoryStats = {};
	const agentStats = {};
	let lastObservedAt = null;
	let lastSuccessAt = null;
	let lastFailureAt = null;
	for (const row of rows) {
		const weight = decayWeight(row.ts, now);
		weightedCalls += weight;
		if (row.success) weightedSuccesses += weight;
		const category = row.category || classifyTask(row.task ?? "");
		if (!categoryStats[category]) categoryStats[category] = {
			calls: 0,
			successes: 0
		};
		categoryStats[category].calls += weight;
		if (row.success) categoryStats[category].successes += weight;
		if (row.agent) {
			const bucket = agentStats[row.agent] ?? (agentStats[row.agent] = {
				calls: 0,
				successes: 0
			});
			bucket.calls += weight;
			if (row.success) bucket.successes += weight;
		}
		if (row.ts && (!lastObservedAt || row.ts > lastObservedAt)) lastObservedAt = row.ts;
		if (row.success && row.ts && (!lastSuccessAt || row.ts > lastSuccessAt)) lastSuccessAt = row.ts;
		if (!row.success && row.ts && (!lastFailureAt || row.ts > lastFailureAt)) lastFailureAt = row.ts;
	}
	const durations = rows.map((r) => parseDurationMs(r.durationMs)).filter((v) => v !== null);
	const observedTokens = rows.map((r) => Number(r.tokens)).filter((v) => Number.isFinite(v) && v > 0);
	const aggregateCalls = Number(tokenSummary.calls) || 0;
	const aggregateTokens = Number(tokenSummary.total) || 0;
	const averageTokens = observedTokens.length ? average(observedTokens) : aggregateCalls > 0 ? aggregateTokens / aggregateCalls : null;
	const averageDurationMs = durations.length ? average(durations) : parseDurationMs(tokenSummary.lastDuration);
	const successScore = bayesianRate(weightedSuccesses, weightedCalls);
	const confidence = clamp01(1 - Math.exp(-weightedCalls / 8));
	const freshness = lastObservedAt ? clamp01(Math.exp(-Math.max(0, now - Date.parse(lastObservedAt)) / (21 * DAY_MS))) : .35;
	const lastSuccessMs = Date.parse(lastSuccessAt ?? "");
	const lastFailureMs = Date.parse(lastFailureAt ?? "");
	const cooldownUntilMs = Number.isFinite(lastFailureMs) && (!Number.isFinite(lastSuccessMs) || lastFailureMs > lastSuccessMs) ? lastFailureMs + 1800 * 1e3 : null;
	const coolingDown = Number.isFinite(cooldownUntilMs) && cooldownUntilMs > now;
	return {
		name: tool.name,
		id: tool.id,
		canonicalId: tool.canonicalId,
		calls: rows.length,
		successes: rows.filter((r) => r.success).length,
		weightedCalls,
		weightedSuccesses,
		successScore,
		stabilityScore: wilsonLowerBound(weightedSuccesses, weightedCalls),
		confidence,
		freshness,
		averageDurationMs,
		averageTokens,
		lastObservedAt,
		lastSuccessAt,
		lastFailureAt,
		cooldownUntil: coolingDown ? new Date(cooldownUntilMs).toISOString() : null,
		coolingDown,
		categoryStats,
		agentStats
	};
}
function capabilityScore(profile, category) {
	const stats = profile.categoryStats?.[category];
	if (!stats || stats.calls <= 0) return profile.successScore;
	const categoryRate = bayesianRate(stats.successes, stats.calls, profile.successScore, 3);
	const categoryConfidence = clamp01(1 - Math.exp(-stats.calls / 4));
	return categoryRate * categoryConfidence + profile.successScore * (1 - categoryConfidence);
}
function latencyScore(averageDurationMs) {
	if (!Number.isFinite(averageDurationMs)) return .45;
	return clamp01(1 / (1 + averageDurationMs / 3e4));
}
function tokenCostScore(averageTokens) {
	if (!Number.isFinite(averageTokens)) return .45;
	return clamp01(1 / (1 + averageTokens / 4e3));
}
/** Score one profile for a task category, with explainable components. */
function scoreRoutingProfile(profile, category, weights = DEFAULT_WEIGHTS) {
	const components = {
		success: clamp01(profile.successScore),
		capability: clamp01(capabilityScore(profile, category)),
		latency: latencyScore(profile.averageDurationMs),
		tokenCost: tokenCostScore(profile.averageTokens),
		freshness: clamp01(profile.freshness),
		stability: clamp01(profile.stabilityScore),
		confidence: clamp01(profile.confidence)
	};
	let weightedScore = 0;
	for (const [key, weight] of Object.entries(weights)) weightedScore += (components[key] ?? 0) * weight;
	const explorationBonus = .04 / Math.sqrt(profile.calls + 1);
	const score = profile.coolingDown ? 0 : clamp01(weightedScore + explorationBonus);
	return {
		...profile,
		category,
		score: Number(score.toFixed(4)),
		components: Object.fromEntries(Object.entries(components).map(([k, v]) => [k, Number(v.toFixed(4))])),
		explorationBonus: Number(explorationBonus.toFixed(4)),
		reason: profile.coolingDown ? `冷却至${profile.cooldownUntil} · 最近失败${profile.lastFailureAt}` : `成功${components.success.toFixed(2)} · 能力${components.capability.toFixed(2)} · 时延${components.latency.toFixed(2)} · Token成本${components.tokenCost.toFixed(2)} · 新鲜度${components.freshness.toFixed(2)} · 稳定性${components.stability.toFixed(2)} · 置信度${components.confidence.toFixed(2)}`
	};
}
/** Rank a set of provider profiles for one task, best first. */
function rankRoutingProfiles(profiles, task, weights = DEFAULT_WEIGHTS) {
	const category = classifyTask(task);
	return (profiles || []).map((profile) => scoreRoutingProfile(profile, category, weights)).sort((a, b) => b.score - a.score || b.confidence - a.confidence || a.name.localeCompare(b.name));
}
//#endregion
//#region lib/types/host/index.js
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
/** Per-provider observation history (ring-capped, newest last). */
const MAX_OBSERVATIONS_PER_PROVIDER = 500;
/** Remote-only service exposing the live provider routing scores. */
let RouterGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _profiles_decorators;
	let _rank_decorators;
	return class RouterGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_profiles_decorators = [Remote("profiles")];
			_rank_decorators = [Remote("rank")];
			__esDecorate(this, null, _profiles_decorators, {
				kind: "method",
				name: "profiles",
				static: false,
				private: false,
				access: {
					has: (obj) => "profiles" in obj,
					get: (obj) => obj.profiles
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _rank_decorators, {
				kind: "method",
				name: "rank",
				static: false,
				private: false,
				access: {
					has: (obj) => "rank" in obj,
					get: (obj) => obj.rank
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
		observations = (__runInitializers(this, _instanceExtraInitializers), /* @__PURE__ */ new Map());
		runStarts = /* @__PURE__ */ new Map();
		constructor(ctx) {
			super(ctx, "router");
			ctx.on("subagent/start", this.onStart);
			ctx.on("subagent/end", this.onEnd);
		}
		/** Record the start timestamp for a delegation, keyed by run id. */
		onStart = (info) => {
			this.runStarts.set(info.runId, Date.now());
		};
		/** Append the run outcome to its provider's history. */
		onEnd = (info) => {
			const startedAt = this.runStarts.get(info.runId);
			this.runStarts.delete(info.runId);
			const success = info.stopReason === "completed";
			const observation = {
				ts: new Date(startedAt ?? Date.now()).toISOString(),
				success,
				...startedAt === void 0 ? {} : { durationMs: Date.now() - startedAt },
				...info.id ? { agent: info.id } : {}
			};
			const history = this.observations.get(info.provider) ?? [];
			history.push(observation);
			if (history.length > MAX_OBSERVATIONS_PER_PROVIDER) history.splice(0, history.length - MAX_OBSERVATIONS_PER_PROVIDER);
			this.observations.set(info.provider, history);
		};
		/** Build one provider's wire-safe profile snapshot. */
		profileOf(name) {
			const observations = this.observations.get(name) ?? [];
			const profile = buildRoutingProfile({
				name,
				id: name,
				canonicalId: name
			}, observations);
			return {
				name: profile.name,
				id: profile.id,
				canonicalId: profile.canonicalId,
				calls: profile.calls,
				successes: profile.successes,
				weightedCalls: profile.weightedCalls,
				weightedSuccesses: profile.weightedSuccesses,
				successScore: profile.successScore,
				stabilityScore: profile.stabilityScore,
				confidence: profile.confidence,
				freshness: profile.freshness,
				averageDurationMs: profile.averageDurationMs,
				averageTokens: profile.averageTokens,
				lastObservedAt: profile.lastObservedAt,
				lastSuccessAt: profile.lastSuccessAt,
				lastFailureAt: profile.lastFailureAt,
				cooldownUntil: profile.cooldownUntil,
				coolingDown: profile.coolingDown,
				agentStats: profile.agentStats
			};
		}
		/** All observed provider profiles (cheap polling view). */
		profiles() {
			return {
				providers: [...this.observations.keys()].map((name) => this.profileOf(name)),
				capturedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
		/**
		* Rank the given candidates for one task; defaults to all observed providers.
		* @param task - the delegation task text (category-classified internally).
		* @param candidates - optional provider-name allowlist; empty = all observed.
		*/
		rank(task, candidates) {
			const ranked = rankRoutingProfiles((candidates && candidates.length > 0 ? [...candidates] : [...this.observations.keys()]).map((name) => buildRoutingProfile({
				name,
				id: name,
				canonicalId: name
			}, this.observations.get(name) ?? [])), task);
			return {
				task,
				category: ranked[0]?.category ?? "general",
				ranked: ranked.map((r) => ({
					name: r.name,
					score: r.score,
					category: r.category,
					components: r.components,
					explorationBonus: r.explorationBonus,
					reason: r.reason,
					profile: this.profileOf(r.name)
				})),
				capturedAt: (/* @__PURE__ */ new Date()).toISOString()
			};
		}
	};
})();
//#endregion
export { RouterGateway, RouterGateway as default };
