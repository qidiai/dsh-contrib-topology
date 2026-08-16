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

import type { Context, FiberState } from '@deepseek-ai/cordis'
import type {} from '@deepseek-ai/cordis-plugin-loader'
import type { SubagentRunEndInfo, SubagentRunInfo } from '@deepseek-ai/dsh-subagent'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type {
  TopologyEdge,
  TopologyFiberPhase,
  TopologyNode,
  TopologyPluginGroup,
  TopologyPluginNode,
  TopologySnapshot,
} from '../types.ts'

export type * from '../types.ts'

/** Runtime mirror: FiberState is a cross-package const enum. */
const FIBER_STATE = {
  PENDING: 0 as FiberState.PENDING,
  LOADING: 1 as FiberState.LOADING,
  ACTIVE: 2 as FiberState.ACTIVE,
  FAILED: 3 as FiberState.FAILED,
  DISPOSED: 4 as FiberState.DISPOSED,
  UNLOADING: 5 as FiberState.UNLOADING,
} as const

const FIBER_PHASE = {
  [FIBER_STATE.PENDING]: 'pending',
  [FIBER_STATE.LOADING]: 'loading',
  [FIBER_STATE.ACTIVE]: 'active',
  [FIBER_STATE.FAILED]: 'failed',
  [FIBER_STATE.DISPOSED]: null,
  [FIBER_STATE.UNLOADING]: 'unloading',
} as const satisfies Record<FiberState, TopologyFiberPhase>

/** Semi-private loader entry shape (beyond the public inventory projection). */
interface LoaderEntryLike {
  id: string
  disabled?: boolean
  options: {
    name?: string
    group?: boolean
    /** Config-level inject declaration (serialized in the loader config). */
    inject?: Record<string, unknown> | string[] | null
  }
  fiber?: {
    state: FiberState
    /** Static inject declarations: service key → config. */
    inject?: Record<string, unknown>
    /** Parent context; its own `.fiber` is the ancestor fiber, if any. */
    parent?: { fiber?: unknown }
  }
}

/** Origin bucket from the package name: core / contrib / third-party. */
function groupOf(name: string): TopologyPluginGroup {
  if (name.startsWith('@deepseek-ai/dsh-contrib-')) return 'contrib'
  if (name.startsWith('@deepseek-ai/')) return 'core'
  return 'third-party'
}

function readInjectKeys(entry: LoaderEntryLike): string[] {
  // Live fiber wins; a disabled entry has no fiber, so fall back to the
  // config-level options.inject declaration to still show what it wires.
  try {
    const fiberInject = entry.fiber?.inject
    if (fiberInject && typeof fiberInject === 'object') {
      return Object.keys(fiberInject).filter((k) => typeof k === 'string' && k.length > 0)
    }
  } catch {
    // fall through to the config-level declaration below
  }
  try {
    const configInject = entry.options.inject
    if (configInject == null) return []
    if (Array.isArray(configInject)) {
      return configInject.filter((k) => typeof k === 'string' && k.length > 0)
    }
    if (typeof configInject === 'object') {
      return Object.keys(configInject).filter((k) => typeof k === 'string' && k.length > 0)
    }
  } catch {
    // contained by design
  }
  return []
}

/**
 * Resolve the parent plugin's entry id by walking the fiber parent chain and
 * matching ancestor fibers back to loader entries. Returns undefined for
 * roots or when the chain cannot be resolved.
 */
function readParentId(entry: LoaderEntryLike, all: LoaderEntryLike[]): string | undefined {
  try {
    const parentFiber = entry.fiber?.parent?.fiber
    if (!parentFiber) return undefined
    const hit = all.find((candidate) => candidate !== entry && candidate.fiber === parentFiber)
    return hit?.id
  } catch {
    return undefined
  }
}

/** Remote-only service exposing the live plugin/service topology graph. */
export class TopologyGateway extends TypertRemoteService {
  static inject = ['loader']

  /** Live subagent delegations: runId → { provider, startedAt, outcome }. */
  private readonly delegations = new Map<string, { provider: string; startedAt: number; outcome: 'success' | 'error' | 'running' }>()
  private readonly runStarts = new Map<string, number>()

  constructor(ctx: Context) {
    super(ctx, 'topology')
    // Track runtime delegations so the graph can show the subagent tree.
    ctx.on('subagent/start', (info: SubagentRunInfo) => {
      this.runStarts.set(info.runId, Date.now())
      this.delegations.set(info.runId, { provider: info.provider, startedAt: Date.now(), outcome: 'running' })
    })
    ctx.on('subagent/end', (info: SubagentRunEndInfo) => {
      const startedAt = this.runStarts.get(info.runId)
      this.runStarts.delete(info.runId)
      this.delegations.set(info.runId, {
        provider: info.provider,
        startedAt: startedAt ?? Date.now(),
        outcome: info.stopReason === 'completed' ? 'success' : 'error',
      })
    })
  }

  /** Live MCP servers, derived from `mcp__<serverName>__*` tool names. */
  private mcpServers(): Map<string, number> {
    const servers = new Map<string, number>()
    try {
      const tools = this.ctx.get('tools') as { schemas?: () => readonly { name?: string }[] } | undefined
      if (tools?.schemas !== undefined) {
        for (const tool of tools.schemas()) {
          const match = typeof tool.name === 'string' ? /^mcp__([^_]+)__/.exec(tool.name) : null
          if (match !== null && match[1] !== undefined) {
            servers.set(match[1], (servers.get(match[1]) ?? 0) + 1)
          }
        }
      }
    } catch {
      // contained by design
    }
    return servers
  }

  /**
   * Read the Loader directly on every call — no second cache to keep in
   * sync with Cordis's own lifecycle events.
   */
  @Remote('graph')
  graph(): TopologySnapshot {
    const loader = this.ctx.loader as unknown as { entries(): Iterable<LoaderEntryLike> }
    const entries: LoaderEntryLike[] = []
    for (const entry of loader.entries()) {
      if (entry.options.group) continue
      entries.push(entry)
    }

    const plugins: TopologyPluginNode[] = entries.map((entry) => {
      const parentId = readParentId(entry, entries)
      const name = entry.options.name ?? entry.id
      return {
        id: entry.id,
        name,
        group: groupOf(name),
        enabled: !entry.disabled,
        fiberPhase: entry.fiber === undefined ? null : FIBER_PHASE[entry.fiber.state],
        injects: readInjectKeys(entry),
        ...(parentId ? { parentId } : {}),
      }
    })

    const nodes: TopologyNode[] = []
    const edges: TopologyEdge[] = []

    for (const plugin of plugins) {
      nodes.push({ kind: 'plugin', plugin })
      if (plugin.parentId) {
        edges.push({ from: plugin.parentId, to: plugin.id, kind: 'contains' })
      }
    }

    // Service hubs: one node per injected ctx key, plugin→service edges.
    const consumerCount = new Map<string, number>()
    for (const plugin of plugins) {
      for (const key of plugin.injects) {
        consumerCount.set(key, (consumerCount.get(key) ?? 0) + 1)
        edges.push({ from: plugin.id, to: `service:${key}`, kind: 'injects' })
      }
    }
    for (const [key, count] of consumerCount) {
      nodes.push({
        kind: 'service',
        service: { id: `service:${key}`, name: key, consumerCount: count },
      })
    }

    // Subagent tree: each live delegation becomes a node, dispatched from the
    // orchestrator plugin (id 'orchestrator' when present) or the provider as
    // a root delegation.
    for (const [runId, d] of this.delegations) {
      nodes.push({
        kind: 'subagent',
        subagent: {
          id: `subagent:${runId}`,
          provider: d.provider,
          outcome: d.outcome,
          ...(d.outcome === 'running' ? {} : { durationMs: Date.now() - d.startedAt }),
        },
      })
      const from = plugins.some((p) => p.id === 'orchestrator') ? 'orchestrator' : d.provider
      edges.push({ from, to: `subagent:${runId}`, kind: 'dispatch' })
    }

    // MCP servers: one node per live mcp__ server, attached to mcp-bridge.
    for (const [serverName, toolCount] of this.mcpServers()) {
      nodes.push({
        kind: 'mcp',
        mcp: { id: `mcp:${serverName}`, serverName, toolCount },
      })
      const from = plugins.some((p) => p.id === 'mcp-bridge') ? 'mcp-bridge' : 'mcp:root'
      edges.push({ from, to: `mcp:${serverName}`, kind: 'provides-mcp' })
    }

    return { nodes, edges, capturedAt: new Date().toISOString() }
  }
}

export default TopologyGateway
