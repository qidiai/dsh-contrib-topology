/**
 * Host-side MCP bridge gateway.
 *
 * Orchestration layer over `@deepseek-ai/dsh-mcp-client`: aggregates the
 * `servers[]` config through the `ai-bridge-mcp` user-settings namespace
 * (hot-reload), spawns one mcp-client instance per server via `ctx.plugin()`
 * (each returns a Fiber), and exposes snapshot/addServer/removeServer Remotes
 * for the Bridge tab. Connection/tool-registration/reconnect/HMR stay with
 * mcp-client.
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
import { existsSync } from 'node:fs';
import { Context } from '@deepseek-ai/cordis';
import * as mcpClient from '@deepseek-ai/dsh-mcp-client';
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings';
import Schema from '@deepseek-ai/schemastery';
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol';
import { BridgeRegistry } from "./registry.js";
/** The `ai-bridge-mcp` user-settings namespace (hot-reload seam). */
const NS = settingsNamespace('ai-bridge-mcp');
/**
 * Flatten an error into a diagnostic string, walking the `cause` chain so the
 * Bridge tab shows the REAL underlying failure (e.g. `spawn ... ENOENT`,
 * `EPERM`, MODULE_NOT_FOUND) instead of mcp-client's outer wrapper message.
 */
function describeError(error) {
    const seen = new Set();
    const parts = [];
    let current = error;
    while (current !== undefined && current !== null && !seen.has(current)) {
        seen.add(current);
        if (current instanceof Error) {
            parts.push(current.message.length > 0 ? current.message : current.name);
            current = current.cause;
        }
        else {
            parts.push(String(current));
            break;
        }
    }
    return parts.length > 1 ? parts.join(' → ') : (parts[0] ?? String(error));
}
/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG = { servers: [] };
/**
 * Resolved-value schema for the bridge settings section. The `as unknown as`
 * assertion mirrors mcp-client's own Config declaration (schemastery union
 * schemas widen to nullable optionals under exactOptionalPropertyTypes).
 */
const Config = Schema.object({
    servers: Schema.array(Schema.object({
        serverName: Schema.string().pattern(/^[A-Za-z0-9_-]{1,32}$/),
        transport: Schema.union(['stdio', 'streamable-http']),
        command: Schema.string().default(''),
        args: Schema.array(Schema.string()).default([]),
        url: Schema.string().default(''),
    })).default([]),
});
/** Remote-only service exposing live MCP server orchestration. */
let McpBridgeGateway = (() => {
    let _classSuper = TypertRemoteService;
    let _instanceExtraInitializers = [];
    let _snapshot_decorators;
    let _probe_decorators;
    let _addServer_decorators;
    let _removeServer_decorators;
    return class McpBridgeGateway extends _classSuper {
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            _snapshot_decorators = [Remote('snapshot')];
            _probe_decorators = [Remote('probe')];
            _addServer_decorators = [Remote('addServer')];
            _removeServer_decorators = [Remote('removeServer')];
            __esDecorate(this, null, _snapshot_decorators, { kind: "method", name: "snapshot", static: false, private: false, access: { has: obj => "snapshot" in obj, get: obj => obj.snapshot }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _probe_decorators, { kind: "method", name: "probe", static: false, private: false, access: { has: obj => "probe" in obj, get: obj => obj.probe }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _addServer_decorators, { kind: "method", name: "addServer", static: false, private: false, access: { has: obj => "addServer" in obj, get: obj => obj.addServer }, metadata: _metadata }, null, _instanceExtraInitializers);
            __esDecorate(this, null, _removeServer_decorators, { kind: "method", name: "removeServer", static: false, private: false, access: { has: obj => "removeServer" in obj, get: obj => obj.removeServer }, metadata: _metadata }, null, _instanceExtraInitializers);
            if (_metadata) Object.defineProperty(this, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
        }
        registry = (__runInitializers(this, _instanceExtraInitializers), new BridgeRegistry());
        config = DEFAULT_CONFIG;
        constructor(ctx) {
            super(ctx, 'mcp-bridge');
            // Hot-reload seam: the settings section drives spawn/dispose diffs.
            // setSource only stores the resolved config; onChange (fired right after
            // attach and on every committed change) is the single applyConfig trigger.
            // This avoids double-spawning a persisted server at attach: the previous
            // fire-and-forget in both hooks raced two applyConfig() runs, and the
            // second spawn failed with 'tool ... is already registered'.
            installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
                setSource: (source) => {
                    this.config = source();
                },
                onChange: () => {
                    void this.applyConfig();
                },
            });
        }
        /** Diff the resolved config against live instances; spawn/remove as needed. */
        async applyConfig() {
            const wanted = new Set(this.config.servers.map((s) => s.serverName));
            for (const name of this.registry.names()) {
                if (!wanted.has(name))
                    this.registry.remove(name);
            }
            for (const server of this.config.servers) {
                if (!this.registry.has(server.serverName)) {
                    await this.spawn(server);
                }
            }
        }
        /** Spawn one mcp-client instance through the cordis plugin registry. */
        async spawn(server) {
            // Preflight: a stdio command that does not exist (e.g. a path mangled to
            // `????` by a non-UTF-8 input chain) would make the child die instantly
            // with a bare MODULE_NOT_FOUND. Fail fast with an actionable error so the
            // Bridge tab shows why instead of a silent no-op.
            if (server.transport === 'stdio' && server.command !== undefined) {
                const probe = server.command.startsWith('"') ? server.command.slice(1, -1) : server.command;
                if (!existsSync(probe)) {
                    this.registry.set({
                        config: server,
                        fiber: { dispose: () => undefined },
                        status: 'failed',
                        lastError: `mcp-bridge: stdio command not found: ${probe} — check the path (non-ASCII paths must survive UTF-8 end to end)`,
                        updatedAt: new Date().toISOString(),
                    });
                    return;
                }
            }
            try {
                // Shape the simplified bridge config into mcp-client's own Config union.
                // failOnStartupError: true makes the INITIAL connect/sync failure reject
                // the fiber (rather than being swallowed into the reconnect loop), so
                // `status` reflects the real connection lifecycle — 'connected' only
                // after the first tool sync, 'failed' with the actual error otherwise.
                const mcpConfig = server.transport === 'stdio'
                    ? { transport: 'stdio', serverName: server.serverName, command: server.command ?? '', args: [...(server.args ?? [])], failOnStartupError: true }
                    : { transport: 'streamable-http', serverName: server.serverName, url: server.url ?? '', failOnStartupError: true };
                // Mount each mcp-client in a FRESH root context that explicitly carries
                // the `tools` service. `ctx.plugin()` on this gateway's own context
                // creates a fiber whose inject chain cannot resolve `ctx.tools` inside
                // the host realm ("cannot get property tools without inject"); a fresh
                // Context with `tools` provided directly resolves it like the top-level
                // cordis.yml rows do. Each server owns its context, so dispose is clean.
                const child = new Context();
                const tools = this.ctx.get('tools');
                if (tools !== undefined) {
                    child.provide('tools', tools);
                }
                const fiber = await child.plugin(mcpClient, mcpConfig);
                this.registry.set({
                    config: server,
                    fiber,
                    status: 'connected',
                    updatedAt: new Date().toISOString(),
                });
            }
            catch (error) {
                this.registry.set({
                    config: server,
                    fiber: { dispose: () => undefined },
                    status: 'failed',
                    lastError: describeError(error),
                    updatedAt: new Date().toISOString(),
                });
            }
        }
        /** All live server states (cheap polling view for the Bridge tab). */
        snapshot() {
            const toolCounts = this.toolCounts();
            const now = new Date().toISOString();
            const servers = this.registry.all().map((instance) => ({
                serverName: instance.config.serverName,
                status: instance.status,
                toolCount: toolCounts.get(instance.config.serverName) ?? 0,
                ...(instance.lastError === undefined ? {} : { lastError: instance.lastError }),
                updatedAt: instance.updatedAt,
            }));
            return { servers, capturedAt: now };
        }
        /** Diagnostic: how visible is the `tools` service from this context? */
        probe() {
            const props = this.ctx.reflect?.props;
            let provideOutcome = 'not attempted';
            try {
                const tools = this.ctx.get('tools');
                if (tools !== undefined) {
                    this.ctx.provide('tools', tools);
                    provideOutcome = 'provided';
                }
                else {
                    provideOutcome = 'no upstream tools';
                }
            }
            catch (e) {
                provideOutcome = `provide threw: ${e instanceof Error ? e.message : String(e)}`;
            }
            const post = this.ctx.reflect?.props;
            const child = this.ctx.extend();
            let childTools = 'unknown';
            try {
                childTools = typeof child.get('tools');
            }
            catch (e) {
                childTools = `threw: ${e instanceof Error ? e.message : String(e)}`;
            }
            return {
                hasToolsIn: 'tools' in this.ctx,
                getTools: typeof this.ctx.get('tools'),
                propsKeys: Object.keys(props ?? {}).slice(0, 20),
                hasToolsProp: props !== undefined && 'tools' in props,
                provideOutcome,
                postHasToolsProp: post !== undefined && 'tools' in post,
                fiberRuntime: typeof this.ctx.fiber?.runtime,
                extendChildGetTools: childTools,
                extendChildHasToolsIn: 'tools' in child,
            };
        }
        /** Best-effort per-server tool counts from the tools service. */
        toolCounts() {
            const counts = new Map();
            try {
                const tools = this.ctx.get('tools');
                if (tools?.schemas !== undefined) {
                    for (const tool of tools.schemas()) {
                        const match = typeof tool.name === 'string' ? /^mcp__([^_]+)__/.exec(tool.name) : null;
                        if (match !== null && match[1] !== undefined) {
                            counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
                        }
                    }
                }
            }
            catch {
                // contained by design: a tools-service probe must never break snapshot()
            }
            return counts;
        }
        /** Add one server at runtime (persisted via the ai-bridge-mcp settings). */
        async addServer(server) {
            const existing = this.registry.get(server.serverName);
            if (existing !== undefined && existing.status !== 'failed') {
                throw new Error(`mcp-bridge: serverName "${server.serverName}" already managed`);
            }
            // A failed placeholder must not block retrying the same serverName.
            if (existing !== undefined)
                this.registry.remove(server.serverName);
            const next = { servers: [...this.config.servers.filter((s) => s.serverName !== server.serverName), server] };
            await this.persistConfig(next);
            return this.snapshot();
        }
        /** Remove one server at runtime (persisted via the ai-bridge-mcp settings). */
        async removeServer(serverName) {
            const next = { servers: this.config.servers.filter((s) => s.serverName !== serverName) };
            await this.persistConfig(next);
            return this.snapshot();
        }
        /**
         * Persist a full config through the `ai-bridge-mcp` settings channel so a
         * restart re-attaches the servers, then apply the live diff. Falls back to
         * in-memory-only when the settings service is unavailable.
         */
        async persistConfig(next) {
            try {
                const settings = this.ctx.get('settings');
                if (settings?.update !== undefined) {
                    await settings.update(NS, { servers: next.servers });
                }
            }
            catch {
                // contained: a persistence failure must never break the live update
            }
            this.config = next;
            await this.applyConfig();
        }
    };
})();
export { McpBridgeGateway };
export default McpBridgeGateway;
//# sourceMappingURL=index.js.map