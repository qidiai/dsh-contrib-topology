/** Shared contract between the topology Host gateway and the Web client. */

/** Lifecycle state of an entry's root Fiber, mirroring dsh plugin-inventory. */
export type TopologyFiberPhase =
  | 'pending'
  | 'loading'
  | 'active'
  | 'failed'
  | 'unloading'
  | null

/**
 * Plugin origin bucket, derived from the package name so the client can
 * partition the graph instead of flattening every plugin into one column.
 * `core` = first-party `@deepseek-ai/dsh-*` packages (excluding contrib),
 * `contrib` = `@deepseek-ai/dsh-contrib-*`, `third-party` = everything else.
 */
export type TopologyPluginGroup = 'core' | 'contrib' | 'third-party'

/** A plugin node: one non-group Cordis Loader entry. */
export interface TopologyPluginNode {
  readonly id: string
  /** Module specifier / display name of the plugin. */
  readonly name: string
  /** Origin bucket derived from the package name. */
  readonly group: TopologyPluginGroup
  readonly enabled: boolean
  readonly fiberPhase: TopologyFiberPhase
  /**
   * Service keys this plugin declares via static inject (best-effort).
   * Reads the live fiber's inject dict; for disabled entries (no fiber) falls
   * back to the config-level `options.inject` declaration so a disabled plugin
   * still shows what it would have wired.
   */
  readonly injects: readonly string[]
  /**
   * Parent plugin id when resolvable from the fiber parent chain
   * (loader tree containment); absent for roots.
   */
  readonly parentId?: string
}

/** A service hub node: a ctx.* key that at least one plugin injects. */
export interface TopologyServiceNode {
  readonly id: string
  /** Service key as mounted on ctx (e.g. "llm", "tools", "sessions"). */
  readonly name: string
  /** How many plugins inject this service. */
  readonly consumerCount: number
}

export type TopologyNode =
  | { kind: 'plugin'; plugin: TopologyPluginNode }
  | { kind: 'service'; service: TopologyServiceNode }

/** Directed edge. plugin→service = "injects"; plugin→plugin = "contains". */
export interface TopologyEdge {
  readonly from: string
  readonly to: string
  readonly kind: 'injects' | 'contains'
}

/** Point-in-time topology snapshot returned by the topology Remote. */
export interface TopologySnapshot {
  readonly nodes: readonly TopologyNode[]
  readonly edges: readonly TopologyEdge[]
  readonly capturedAt: string
}
