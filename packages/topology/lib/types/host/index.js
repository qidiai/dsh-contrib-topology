/**
 * Host-side topology gateway.
 *
 * Reads the Cordis Loader directly on every call (same truth source as
 * dsh's own plugin-inventory) and projects it into a plugin/service graph:
 *
 *   - nodes (plugin) : one per non-group Loader entry
 *   - nodes (service): one per ctx.* key that at least one plugin injects
 *   - edges (injects): plugin → service, from the plugin fiber's inject dict
 *   - edges (contains): parent plugin → child plugin, from the fiber
 *     parent chain (loader tree containment), best-effort
 *
 * Everything fiber-related is guarded: Cordis internals beyond the public
 * inventory projection are semi-private, so a failed read degrades to a
 * flatter graph instead of breaking the snapshot.
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
/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
    PENDING: 0,
    LOADING: 1,
    ACTIVE: 2,
    FAILED: 3,
    DISPOSED: 4,
    UNLOADING: 5,
};
const FIBER_PHASE = {
    [FIBER_STATE.PENDING]: 'pending',
    [FIBER_STATE.LOADING]: 'loading',
    [FIBER_STATE.ACTIVE]: 'active',
    [FIBER_STATE.FAILED]: 'failed',
    [FIBER_STATE.DISPOSED]: null,
    [FIBER_STATE.UNLOADING]: 'unloading',
};
/** Origin bucket from the package name: core / contrib / third-party. */
function groupOf(name) {
    if (name.startsWith('@deepseek-ai/dsh-contrib-'))
        return 'contrib';
    if (name.startsWith('@deepseek-ai/'))
        return 'core';
    return 'third-party';
}
function readInjectKeys(entry) {
    // Live fiber wins; a disabled entry has no fiber, so fall back to the
    // config-level options.inject declaration to still show what it wires.
    try {
        const fiberInject = entry.fiber?.inject;
        if (fiberInject && typeof fiberInject === 'object') {
            return Object.keys(fiberInject).filter((k) => typeof k === 'string' && k.length > 0);
        }
    }
    catch {
        // fall through to the config-level declaration below
    }
    try {
        const configInject = entry.options.inject;
        if (configInject == null)
            return [];
        if (Array.isArray(configInject)) {
            return configInject.filter((k) => typeof k === 'string' && k.length > 0);
        }
        if (typeof configInject === 'object') {
            return Object.keys(configInject).filter((k) => typeof k === 'string' && k.length > 0);
        }
    }
    catch {
        // contained by design
    }
    return [];
}
/**
 * Resolve the parent plugin's entry id by walking the fiber parent chain and
 * matching ancestor fibers back to loader entries. Returns undefined for
 * roots or when the chain cannot be resolved.
 */
function readParentId(entry, all) {
    try {
        const parentFiber = entry.fiber?.parent?.fiber;
        if (!parentFiber)
            return undefined;
        const hit = all.find((candidate) => candidate !== entry && candidate.fiber === parentFiber);
        return hit?.id;
    }
    catch {
        return undefined;
    }
}
/** Remote-only service exposing the live plugin/service topology graph. */
let TopologyGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _graph_decorators;
    return class TopologyGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _graph_decorators = [Remote('graph')];
            __esDecorate(this, null, _graph_decorators, { kind: "method", name: "graph", static: false, private: false, access: { has: obj => "graph" in obj, get: obj => obj.graph }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        static inject = ['loader'];
        constructor(ctx) {
            super(ctx, 'topology');
            __runInitializers(this, _instanceExtraInitializers);
        }
        /**
         * Read the Loader directly on every call — no second cache to keep in
         * sync with Cordis's own lifecycle events.
         */
        graph() {
            const loader = this.ctx.loader;
            const entries = [];
            for (const entry of loader.entries()) {
                if (entry.options.group)
                    continue;
                entries.push(entry);
            }
            const plugins = entries.map((entry) => {
                const parentId = readParentId(entry, entries);
                const name = entry.options.name ?? entry.id;
                return {
                    id: entry.id,
                    name,
                    group: groupOf(name),
                    enabled: !entry.disabled,
                    fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
                    injects: readInjectKeys(entry),
                    ...(parentId ? { parentId } : {}),
                };
            });
            const nodes = [];
            const edges = [];
            for (const plugin of plugins) {
                nodes.push({ kind: 'plugin', plugin });
                if (plugin.parentId) {
                    edges.push({ from: plugin.parentId, to: plugin.id, kind: 'contains' });
                }
            }
            // Service hubs: one node per injected ctx key, plugin→service edges.
            const consumerCount = new Map();
            for (const plugin of plugins) {
                for (const key of plugin.injects) {
                    consumerCount.set(key, (consumerCount.get(key) ?? 0) + 1);
                    edges.push({ from: plugin.id, to: `service:${key}`, kind: 'injects' });
                }
            }
            for (const [key, count] of consumerCount) {
                nodes.push({
                    kind: 'service',
                    service: { id: `service:${key}`, name: key, consumerCount: count },
                });
            }
            return { nodes, edges, capturedAt: new Date().toISOString() };
        }
    };
})();
export { TopologyGateway };
export default TopologyGateway;
//# sourceMappingURL=index.js.map