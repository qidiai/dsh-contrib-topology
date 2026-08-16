/**
 * Bridge registry — one mcp-client instance per server, keyed by serverName.
 *
 * Each entry owns the cordis Fiber returned by `ctx.plugin(mcpClient, config)`;
 * removal calls `fiber.dispose()`, which releases the connection, unregisters
 * the `mcp__<serverName>__*` tools, and frees the serverName reservation.
 */

import type { BridgeServerState, McpServerConfig } from '../types.ts'

/** The subset of a cordis Fiber the registry needs for teardown. */
export interface Disposable {
  dispose(): unknown
}

/** A live bridge-managed server instance. */
export interface BridgeInstance {
  readonly config: McpServerConfig
  /** Fiber hosting the mcp-client instance; dispose() to remove. */
  readonly fiber: Disposable
  status: BridgeServerState['status']
  lastError?: string
  updatedAt: string
}

/** serverName → live instance table. */
export class BridgeRegistry {
  private readonly instances = new Map<string, BridgeInstance>()

  /** True when a serverName is already managed (mcp-client would also reject). */
  has(serverName: string): boolean {
    return this.instances.has(serverName)
  }

  /** Register a live instance (the caller has already spawned mcp-client). */
  set(instance: BridgeInstance): void {
    this.instances.set(instance.config.serverName, instance)
  }

  /** Retrieve one instance, or undefined when not managed. */
  get(serverName: string): BridgeInstance | undefined {
    return this.instances.get(serverName)
  }

  /** All instances, insertion-ordered. */
  all(): BridgeInstance[] {
    return [...this.instances.values()]
  }

  /** serverName keys managed by this registry. */
  names(): string[] {
    return [...this.instances.keys()]
  }

  /** Dispose one instance (fiber release) and drop it from the table. */
  remove(serverName: string): boolean {
    const instance = this.instances.get(serverName)
    if (instance === undefined) return false
    this.instances.delete(serverName)
    try {
      instance.fiber.dispose()
    } catch {
      // contained by design: registry teardown must never break the host
    }
    return true
  }

  /** Dispose every instance (host shutdown / config replaced wholesale). */
  clear(): void {
    for (const name of this.names()) this.remove(name)
  }
}
