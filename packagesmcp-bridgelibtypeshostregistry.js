/**
 * Bridge registry — one mcp-client instance per server, keyed by serverName.
 *
 * Each entry owns the cordis Fiber returned by `ctx.plugin(mcpClient, config)`;
 * removal calls `fiber.dispose()`, which releases the connection, unregisters
 * the `mcp__<serverName>__*` tools, and frees the serverName reservation.
 */
/** serverName → live instance table. */
export class BridgeRegistry {
    instances = new Map();
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
        if (instance === undefined)
            return false;
        this.instances.delete(serverName);
        try {
            instance.fiber.dispose();
        }
        catch {
            // contained by design: registry teardown must never break the host
        }
        return true;
    }
    /** Dispose every instance (host shutdown / config replaced wholesale). */
    clear() {
        for (const name of this.names())
            this.remove(name);
    }
}
//# sourceMappingURL=registry.js.map