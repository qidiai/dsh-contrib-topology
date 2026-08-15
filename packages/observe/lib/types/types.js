/**
 * Shared contract between the observe Host gateway and the Web client.
 *
 * DESIGN NOTE (see DESIGN.md §3): this schema is deliberately shaped as the
 * training-data format for the suite's next stage (Bayesian routing across
 * subagent providers). `agent`, `outcome`, `durationMs` and `features` are
 * captured from day one so the router can read real history instead of
 * synthetic fixtures. `source` auto-detects MCP tools (`mcp__*`) so the
 * future MCP bridge is covered with zero changes here.
 */
export {};
//# sourceMappingURL=types.js.map