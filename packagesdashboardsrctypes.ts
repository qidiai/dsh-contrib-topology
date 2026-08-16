/**
 * ai-bridge suite dashboard — shared status contract.
 *
 * The dashboard aggregates the five suite plugins' live state. Aggregation
 * happens on the CLIENT side (direct Remote calls to topology/observe/router/
 * orchestrator/mcp-bridge), so this contract is intentionally thin; the host
 * gateway is a class-shape placeholder for roster loading.
 */

/** Suite-wide status cards, each mapping to one plugin's Remote. */
export interface DashboardStatus {
  readonly topology: { ok: boolean; detail: string }
  readonly observe: { ok: boolean; detail: string }
  readonly router: { ok: boolean; detail: string }
  readonly orchestrator: { ok: boolean; detail: string }
  readonly mcpBridge: { ok: boolean; detail: string }
  readonly capturedAt: string
}
