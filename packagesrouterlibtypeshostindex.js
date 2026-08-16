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
import { buildRoutingProfile, rankRoutingProfiles } from "../routing.js";
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
            _profiles_decorators = [Remote('profiles')];
            _rank_decorators = [Remote('rank')];
            __esDecorate(this, null, _profiles_decorators, { kind: "method", name: "profiles", static: false, private: false, access: { has: obj => "profiles" in obj, get: obj => obj.profiles }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _rank_decorators, { kind: "method", name: "rank", static: false, private: false, access: { has: obj => "rank" in obj, get: obj => obj.rank }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        observations = (__runInitializers(this, _instanceExtraInitializers), new Map());
        runStarts = new Map();
        constructor(ctx) {
            super(ctx, 'router');
            ctx.on('subagent/start', this.onStart);
            ctx.on('subagent/end', this.onEnd);
        }
        /** Record the start timestamp for a delegation, keyed by run id. */
        onStart = (info) => {
            this.runStarts.set(info.runId, Date.now());
        };
        /** Append the run outcome to its provider's history. */
        onEnd = (info) => {
            const startedAt = this.runStarts.get(info.runId);
            this.runStarts.delete(info.runId);
            const success = info.stopReason === 'completed';
            const observation = {
                ts: new Date(startedAt ?? Date.now()).toISOString(),
                success,
                ...(startedAt === undefined ? {} : { durationMs: Date.now() - startedAt }),
                // The child session id is the session-aware routing key (same key
                // observe uses for its `agent` dimension).
                ...(info.id ? { agent: info.id } : {}),
            };
            const history = this.observations.get(info.provider) ?? [];
            history.push(observation);
            if (history.length > MAX_OBSERVATIONS_PER_PROVIDER) {
                history.splice(0, history.length - MAX_OBSERVATIONS_PER_PROVIDER);
            }
            this.observations.set(info.provider, history);
        };
        /** Build one provider's wire-safe profile snapshot. */
        profileOf(name) {
            const observations = this.observations.get(name) ?? [];
            const profile = buildRoutingProfile({ name, id: name, canonicalId: name }, observations);
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
                agentStats: profile.agentStats,
            };
        }
        /** All observed provider profiles (cheap polling view). */
        profiles() {
            return {
                providers: [...this.observations.keys()].map((name) => this.profileOf(name)),
                capturedAt: new Date().toISOString(),
            };
        }
        /**
         * Rank the given candidates for one task; defaults to all observed providers.
         * @param task - the delegation task text (category-classified internally).
         * @param candidates - optional provider-name allowlist; empty = all observed.
         */
        rank(task, candidates) {
            const names = candidates && candidates.length > 0
                ? [...candidates]
                : [...this.observations.keys()];
            const profiles = names.map((name) => buildRoutingProfile({ name, id: name, canonicalId: name }, this.observations.get(name) ?? []));
            const ranked = rankRoutingProfiles(profiles, task);
            return {
                task,
                category: ranked[0]?.category ?? 'general',
                ranked: ranked.map((r) => ({
                    name: r.name,
                    score: r.score,
                    category: r.category,
                    components: r.components,
                    explorationBonus: r.explorationBonus,
                    reason: r.reason,
                    profile: this.profileOf(r.name),
                })),
                capturedAt: new Date().toISOString(),
            };
        }
    };
})();
export { RouterGateway };
export default RouterGateway;
//# sourceMappingURL=index.js.map