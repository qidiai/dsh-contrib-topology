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
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type {
  TopologyEdge,
  TopologyFiberPhase,
  TopologyNode,
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
  options: { name?: string; group?: boolean }
  fiber?: {
    state: FiberState
    /** Static inject declarations: service key → config. */
    inject?: Record<string, unknown>
    /** Parent context; its own `.fiber` is the ancestor fiber, if any. */
    parent?: { fiber?: unknown }
  }
}

function readInjectKeys(entry: LoaderEntryLike): string[] {
  try {
    const inject = entry.fiber?.inject
    if (!inject || typeof inject !== 'object') return []
    return Object.keys(inject).filter((k) => typeof k === 'string' && k.length > 0)
  } catch {
    return []
  }
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

  constructor(ctx: Context) {
    super(ctx, 'topology')
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
      return {
        id: entry.id,
        name: entry.options.name ?? entry.id,
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

    return { nodes, edges, capturedAt: new Date().toISOString() }
  }
}

export default TopologyGateway
