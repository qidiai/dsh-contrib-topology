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

import { existsSync } from 'node:fs'
import type { Context } from '@deepseek-ai/cordis'
import * as mcpClient from '@deepseek-ai/dsh-mcp-client'
import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import Schema from '@deepseek-ai/schemastery'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type { BridgeServerState, BridgeSnapshot, McpBridgeConfig, McpServerConfig } from '../types.ts'
import { BridgeRegistry } from './registry.ts'

export type * from '../types.ts'

/** The `ai-bridge-mcp` user-settings namespace (hot-reload seam). */
const NS = settingsNamespace('ai-bridge-mcp')

/** Composition defaults; the settings section overrides them at attach. */
const DEFAULT_CONFIG: McpBridgeConfig = { servers: [] }

/**
 * Resolved-value schema for the bridge settings section. The `as unknown as`
 * assertion mirrors mcp-client's own Config declaration (schemastery union
 * schemas widen to nullable optionals under exactOptionalPropertyTypes).
 */
const Config: Schema<McpBridgeConfig> = Schema.object({
  servers: Schema.array(Schema.object({
    serverName: Schema.string().pattern(/^[A-Za-z0-9_-]{1,32}$/),
    transport: Schema.union(['stdio', 'streamable-http']),
    command: Schema.string().default(''),
    args: Schema.array(Schema.string()).default([]),
    url: Schema.string().default(''),
  })).default([]),
}) as unknown as Schema<McpBridgeConfig>

/** Remote-only service exposing live MCP server orchestration. */
export class McpBridgeGateway extends TypertRemoteService {
  private readonly registry = new BridgeRegistry()
  private config: McpBridgeConfig = DEFAULT_CONFIG

  constructor(ctx: Context) {
    super(ctx, 'mcp-bridge')
    // Hot-reload seam: the settings section drives spawn/dispose diffs.
    installSettingsSection(ctx, NS, Config, DEFAULT_CONFIG, {
      setSource: (source) => {
        this.config = source()
        void this.applyConfig()
      },
      onChange: () => {
        void this.applyConfig()
      },
    })
  }

  /** Diff the resolved config against live instances; spawn/remove as needed. */
  private async applyConfig(): Promise<void> {
    const wanted = new Set(this.config.servers.map((s) => s.serverName))
    for (const name of this.registry.names()) {
      if (!wanted.has(name)) this.registry.remove(name)
    }
    for (const server of this.config.servers) {
      if (!this.registry.has(server.serverName)) {
        await this.spawn(server)
      }
    }
  }

  /** Spawn one mcp-client instance through the cordis plugin registry. */
  private async spawn(server: McpServerConfig): Promise<void> {
    // Preflight: a stdio command that does not exist (e.g. a path mangled to
    // `????` by a non-UTF-8 input chain) would make the child die instantly
    // with a bare MODULE_NOT_FOUND. Fail fast with an actionable error so the
    // Bridge tab shows why instead of a silent no-op.
    if (server.transport === 'stdio' && server.command !== undefined) {
      const probe = server.command.startsWith('"') ? server.command.slice(1, -1) : server.command
      if (!existsSync(probe)) {
        this.registry.set({
          config: server,
          fiber: { dispose: () => undefined },
          status: 'failed',
          lastError: `mcp-bridge: stdio command not found: ${probe} — check the path (non-ASCII paths must survive UTF-8 end to end)`,
          updatedAt: new Date().toISOString(),
        })
        return
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
        : { transport: 'streamable-http', serverName: server.serverName, url: server.url ?? '', failOnStartupError: true }
      const fiber = await this.ctx.plugin(mcpClient, mcpConfig as unknown as never)
      this.registry.set({
        config: server,
        fiber,
        status: 'connected',
        updatedAt: new Date().toISOString(),
      })
    } catch (error) {
      this.registry.set({
        config: server,
        fiber: { dispose: () => undefined },
        status: 'failed',
        lastError: error instanceof Error ? error.message : String(error),
        updatedAt: new Date().toISOString(),
      })
    }
  }

  /** All live server states (cheap polling view for the Bridge tab). */
  @Remote('snapshot')
  snapshot(): BridgeSnapshot {
    const toolCounts = this.toolCounts()
    const now = new Date().toISOString()
    const servers: BridgeServerState[] = this.registry.all().map((instance) => ({
      serverName: instance.config.serverName,
      status: instance.status,
      toolCount: toolCounts.get(instance.config.serverName) ?? 0,
      ...(instance.lastError === undefined ? {} : { lastError: instance.lastError }),
      updatedAt: instance.updatedAt,
    }))
    return { servers, capturedAt: now }
  }

  /** Best-effort per-server tool counts from the tools service. */
  private toolCounts(): Map<string, number> {
    const counts = new Map<string, number>()
    try {
      const tools = this.ctx.get('tools') as { list?: () => readonly { name?: string }[] } | undefined
      if (tools?.list !== undefined) {
        for (const tool of tools.list()) {
          const match = typeof tool.name === 'string' ? /^mcp__([^_]+)__/.exec(tool.name) : null
          if (match !== null && match[1] !== undefined) {
            counts.set(match[1], (counts.get(match[1]) ?? 0) + 1)
          }
        }
      }
    } catch {
      // contained by design: a tools-service probe must never break snapshot()
    }
    return counts
  }

  /** Add one server at runtime (settings diff drives the actual spawn). */
  @Remote('addServer')
  async addServer(server: McpServerConfig): Promise<BridgeSnapshot> {
    const existing = this.registry.get(server.serverName)
    if (existing !== undefined && existing.status !== 'failed') {
      throw new Error(`mcp-bridge: serverName "${server.serverName}" already managed`)
    }
    // A failed placeholder must not block retrying the same serverName.
    if (existing !== undefined) this.registry.remove(server.serverName)
    const next: McpBridgeConfig = { servers: [...this.config.servers.filter((s) => s.serverName !== server.serverName), server] }
    this.config = next
    await this.applyConfig()
    return this.snapshot()
  }

  /** Remove one server at runtime. */
  @Remote('removeServer')
  removeServer(serverName: string): BridgeSnapshot {
    this.config = {
      servers: this.config.servers.filter((s) => s.serverName !== serverName),
    }
    this.registry.remove(serverName)
    return this.snapshot()
  }
}

export default McpBridgeGateway
