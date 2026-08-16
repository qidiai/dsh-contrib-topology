import { existsSync } from "node:fs";
import * as mcpClient from "@deepseek-ai/dsh-mcp-client";
import { installSettingsSection, settingsNamespace } from "@deepseek-ai/dsh-settings";
import Schema from "@deepseek-ai/schemastery";
import { Remote, TypertRemoteService } from "@deepseek-ai/dsh-typert-protocol";
//#region lib/types/host/registry.js
/**
* Bridge registry — one mcp-client instance per server, keyed by serverName.
*
* Each entry owns the cordis Fiber returned by `ctx.plugin(mcpClient, config)`;
* removal calls `fiber.dispose()`, which releases the connection, unregisters
* the `mcp__<serverName>__*` tools, and frees the serverName reservation.
*/
/** serverName → live instance table. */
var BridgeRegistry = class {
	instances = /* @__PURE__ */ new Map();
	/** True when a serverName is already managed (mcp-client would also reject). */
	has(serverName) {
		return this.instances.has(serverName);
	}
	/** Register a live instance (the caller has already spawned mcp-client). */
	set(instance) {
		this.instances.set(instance.config.serverName, instance);
	}
	/** Retrieve one instance, or undefined when not managed. */
	get(serverName) {
		return this.instances.get(serverName);
	}
	/** All instances, insertion-ordered. */
	all() {
		return [...this.instances.values()];
	}
	/** serverName keys managed by this registry. */
	names() {
		return [...this.instances.keys()];
	}
	/** Dispose one instance (fiber release) and drop it from the table. */
	remove(serverName) {
		const instance = this.instances.get(serverName);
		if (instance === void 0) return false;
		this.instances.delete(serverName);
		try {
			instance.fiber.dispose();
		} catch {}
		return true;
	}
	/** Dispose every instance (host shutdown / config replaced wholesale). */
	clear() {
		for (const name of this.names()) this.remove(name);
	}
};
//#endregion
//#region lib/types/host/index.js
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
/** The `ai-bridge-mcp` user-settings namespace (hot-reload seam). */
const NS = settingsNamespace("ai-bridge-mcp");
/**
* Flatten an error into a diagnostic string, walking the `cause` chain so the
* Bridge tab shows the REAL underlying failure (e.g. `spawn ... ENOENT`,
* `EPERM`, MODULE_NOT_FOUND) instead of mcp-client's outer wrapper message.
*/
function describeError(error) {
	const seen = /* @__PURE__ */ new Set();
	const parts = [];
	let current = error;
	while (current !== void 0 && current !== null && !seen.has(current)) {
		seen.add(current);
		if (current instanceof Error) {
			parts.push(current.message.length > 0 ? current.message : current.name);
			current = current.cause;
		} else {
			parts.push(String(current));
			break;
		}
	}
	return parts.length > 1 ? parts.join(" → ") : parts[0] ?? String(error);
}
/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG = { servers: [] };
/**
* Resolved-value schema for the bridge settings section. The `as unknown as`
* assertion mirrors mcp-client's own Config declaration (schemastery union
* schemas widen to nullable optionals under exactOptionalPropertyTypes).
*/
const Config = Schema.object({ servers: Schema.array(Schema.object({
	serverName: Schema.string().pattern(/^[A-Za-z0-9_-]{1,32}$/),
	transport: Schema.union(["stdio", "streamable-http"]),
	command: Schema.string().default(""),
	args: Schema.array(Schema.string()).default([]),
	url: Schema.string().default("")
})).default([]) });
/** Remote-only service exposing live MCP server orchestration. */
let McpBridgeGateway = (() => {
	let _classSuper = TypertRemoteService;
	let _instanceExtraInitializers = [];
	let _snapshot_decorators;
	let _addServer_decorators;
	let _removeServer_decorators;
	return class McpBridgeGateway extends _classSuper {
		static {
			const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
			_snapshot_decorators = [Remote("snapshot")];
			_addServer_decorators = [Remote("addServer")];
			_removeServer_decorators = [Remote("removeServer")];
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
			__esDecorate(this, null, _addServer_decorators, {
				kind: "method",
				name: "addServer",
				static: false,
				private: false,
				access: {
					has: (obj) => "addServer" in obj,
					get: (obj) => obj.addServer
				},
				metadata: _metadata
			}, null, _instanceExtraInitializers);
			__esDecorate(this, null, _removeServer_decorators, {
				kind: "method",
				name: "removeServer",
				static: false,
				private: false,
				access: {
					has: (obj) => "removeServer" in obj,
					get: (obj) => obj.removeServer
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
		registry = (__runInitializers(this, _instanceExtraInitializers), new BridgeRegistry());
		config = DEFAULT_CONFIG;
		constructor(ctx) {
			super(ctx, "mcp-bridge");
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
		/** Diff the resolved config against live instances; spawn/remove as needed. */
		async applyConfig() {
			const wanted = new Set(this.config.servers.map((s) => s.serverName));
			for (const name of this.registry.names()) if (!wanted.has(name)) this.registry.remove(name);
			for (const server of this.config.servers) if (!this.registry.has(server.serverName)) await this.spawn(server);
		}
		/** Spawn one mcp-client instance through the cordis plugin registry. */
		async spawn(server) {
			if (server.transport === "stdio" && server.command !== void 0) {
				const probe = server.command.startsWith("\"") ? server.command.slice(1, -1) : server.command;
				if (!existsSync(probe)) {
					this.registry.set({
						config: server,
						fiber: { dispose: () => void 0 },
						status: "failed",
						lastError: `mcp-bridge: stdio command not found: ${probe} — check the path (non-ASCII paths must survive UTF-8 end to end)`,
						updatedAt: (/* @__PURE__ */ new Date()).toISOString()
					});
					return;
				}
			}
			try {
				const mcpConfig = server.transport === "stdio" ? {
					transport: "stdio",
					serverName: server.serverName,
					command: server.command ?? "",
					args: [...server.args ?? []],
					failOnStartupError: true
				} : {
					transport: "streamable-http",
					serverName: server.serverName,
					url: server.url ?? "",
					failOnStartupError: true
				};
				const fiber = await this.ctx.plugin(mcpClient, mcpConfig);
				this.registry.set({
					config: server,
					fiber,
					status: "connected",
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
			} catch (error) {
				this.registry.set({
					config: server,
					fiber: { dispose: () => void 0 },
					status: "failed",
					lastError: describeError(error),
					updatedAt: (/* @__PURE__ */ new Date()).toISOString()
				});
			}
		}
		/** All live server states (cheap polling view for the Bridge tab). */
		snapshot() {
			const toolCounts = this.toolCounts();
			const now = (/* @__PURE__ */ new Date()).toISOString();
			return {
				servers: this.registry.all().map((instance) => ({
					serverName: instance.config.serverName,
					status: instance.status,
					toolCount: toolCounts.get(instance.config.serverName) ?? 0,
					...instance.lastError === void 0 ? {} : { lastError: instance.lastError },
					updatedAt: instance.updatedAt
				})),
				capturedAt: now
			};
		}
		/** Best-effort per-server tool counts from the tools service. */
		toolCounts() {
			const counts = /* @__PURE__ */ new Map();
			try {
				const tools = this.ctx.get("tools");
				if (tools?.list !== void 0) for (const tool of tools.list()) {
					const match = typeof tool.name === "string" ? /^mcp__([^_]+)__/.exec(tool.name) : null;
					if (match !== null && match[1] !== void 0) counts.set(match[1], (counts.get(match[1]) ?? 0) + 1);
				}
			} catch {}
			return counts;
		}
		/** Add one server at runtime (settings diff drives the actual spawn). */
		async addServer(server) {
			const existing = this.registry.get(server.serverName);
			if (existing !== void 0 && existing.status !== "failed") throw new Error(`mcp-bridge: serverName "${server.serverName}" already managed`);
			if (existing !== void 0) this.registry.remove(server.serverName);
			const next = { servers: [...this.config.servers.filter((s) => s.serverName !== server.serverName), server] };
			this.config = next;
			await this.applyConfig();
			return this.snapshot();
		}
		/** Remove one server at runtime. */
		removeServer(serverName) {
			this.config = { servers: this.config.servers.filter((s) => s.serverName !== serverName) };
			this.registry.remove(serverName);
			return this.snapshot();
		}
	};
})();
//#endregion
export { McpBridgeGateway, McpBridgeGateway as default };
