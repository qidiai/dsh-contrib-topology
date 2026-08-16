/**
 * ai-bridge suite dashboard — shared status contract.
 *
 * The dashboard aggregates the five suite plugins' live state. Aggregation
 * happens on the CLIENT side (direct Remote calls to topology/observe/router/
 * orchestrator/mcp-bridge), so the contract carries lightweight per-plugin
 * detail payloads for the expandable cards. The host gateway is a class-shape
 * placeholder for roster loading.
 */

/** Base card state: reachable + one-line detail. */
export interface DashboardCard {
  readonly ok: boolean
  readonly detail: string
}

/** Lightweight topology summary (nodes per kind + edge count). */
export interface TopologySummary {
  readonly plugins: number
  readonly services: number
  readonly subagents: number
  readonly mcps: number
  readonly edges: number
}

/** One observe timeline event (read-only, no bodies). */
export interface ObserveEventLite {
  readonly kind: 'tool.call' | 'llm.stream' | 'subagent.dispatch'
  readonly name: string
  readonly outcome: 'success' | 'error' | 'cancelled'
  readonly source: 'builtin' | 'mcp'
  readonly durationMs?: number
}

/** One router provider line for the ranking card. */
export interface RouterProviderLite {
  readonly name: string
  readonly calls: number
  readonly successes: number
  readonly successScore: number
  readonly confidence: number
  readonly coolingDown: boolean
}

/** One orchestrator dispatch line. */
export interface OrchestratorHistoryLite {
  readonly mode: string
  readonly task: string
  readonly winner?: string
  readonly allOk: boolean
  readonly durationMs: number
}

/** One MCP server line. */
export interface McpServerLite {
  readonly serverName: string
  readonly status: string
  readonly toolCount: number
  readonly lastError?: string
}

/** Suite-wide status cards, each carrying its expandable detail payload. */
export interface DashboardStatus {
  readonly topology: DashboardCard & { readonly summary?: TopologySummary }
  readonly observe: DashboardCard & { readonly events?: readonly ObserveEventLite[] }
  readonly router: DashboardCard & { readonly providers?: readonly RouterProviderLite[] }
  readonly orchestrator: DashboardCard & { readonly history?: readonly OrchestratorHistoryLite[] }
  readonly mcpBridge: DashboardCard & { readonly servers?: readonly McpServerLite[] }
  readonly capturedAt: string
}
