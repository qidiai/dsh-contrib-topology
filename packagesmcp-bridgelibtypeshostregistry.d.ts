/**
 * Bridge registry — one mcp-client instance per server, keyed by serverName.
 *
 * Each entry owns the cordis Fiber returned by `ctx.plugin(mcpClient, config)`;
 * removal calls `fiber.dispose()`, which releases the connection, unregisters
 * the `mcp__<serverName>__*` tools, and frees the serverName reservation.
 */
import type { BridgeServerState, McpServerConfig } from '../types.ts';
/** The subset of a cordis Fiber the registry needs for teardown. */
export interface Disposable {
    dispose(): unknown;
}
/** A live bridge-managed server instance. */
export interface BridgeInstance {
    readonly config: McpServerConfig;
    /** Fiber hosting the mcp-client instance; dispose() to remove. */
    readonly fiber: Disposable;
    status: BridgeServerState['status'];
    lastError?: string;
    updatedAt: string;
}
/** serverName → live instance table. */
export declare class BridgeRegistry {
    private readonly instances;
    /** True when a serverName is already managed (mcp-client would also reject). */
    has(serverName: string): boolean;
    /** Register a live instance (the caller has already spawned mcp-client). */
    set(instance: BridgeInstance): void;
    /** Retrieve one instance, or undefined when not managed. */
    get(serverName: string): BridgeInstance | undefined;
    /** All instances, insertion-ordered. */
    all(): BridgeInstance[];
    /** serverName keys managed by this registry. */
    names(): string[];
    /** Dispose one instance (fiber release) and drop it from the table. */
    remove(serverName: string): boolean;
    /** Dispose every instance (host shutdown / config replaced wholesale). */
    clear(): void;
}
//# sourceMappingURL=registry.d.ts.map