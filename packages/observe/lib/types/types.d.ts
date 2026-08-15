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
/** What produced the event. P2 adds 'subagent.dispatch'. */
export type ObserveEventKind = 'tool.call' | 'llm.stream';
/** Reward signal for the future router. */
export type ObserveOutcome = 'success' | 'error' | 'cancelled';
/** Tool provenance; MCP-bridge tools self-identify via the mcp__ prefix. */
export type ObserveSource = 'builtin' | 'mcp';
/** One observed runtime event. Metadata only — never argument/message bodies. */
export interface ObserveEvent {
    readonly id: string;
    readonly kind: ObserveEventKind;
    /** Tool name, or `${provider}/${model}` for LLM streams. */
    readonly name: string;
    /** Caller agent key when resolvable — the session-aware routing key. */
    readonly agent?: string;
    readonly startedAt: string;
    readonly durationMs?: number;
    readonly outcome: ObserveOutcome;
    readonly source: ObserveSource;
    /** Feature vector carrier for the future router (counts only, e.g. chunks). */
    readonly features?: Record<string, number | string | boolean>;
}
/** Per-tool aggregate for the M3 ranking panel. */
export interface ObserveToolStat {
    readonly name: string;
    readonly calls: number;
    readonly errors: number;
    /** errors / calls; 0 when the tool has no calls. */
    readonly errorRate: number;
}
/** Per-model aggregate for the M3 ranking panel. */
export interface ObserveModelStat {
    readonly name: string;
    readonly streams: number;
    readonly avgDurationMs: number;
    readonly totalChunks: number;
}
/** Aggregate counters returned alongside the event window. */
export interface ObserveStats {
    readonly totalEvents: number;
    readonly toolCalls: number;
    readonly llmStreams: number;
    readonly errorCount: number;
    /** Events evicted by the ring buffer since startup (capacity signal). */
    readonly droppedCount: number;
    /** errors / totalEvents; 0 when no events have been observed. */
    readonly errorRate: number;
    /** Most-called tools first (top 8). */
    readonly topTools: readonly ObserveToolStat[];
    /** Most-streamed models first (top 8). */
    readonly topModels: readonly ObserveModelStat[];
}
/** Point-in-time observation window returned by the observe Remote. */
export interface ObserveSnapshot {
    readonly events: readonly ObserveEvent[];
    readonly stats: ObserveStats;
    readonly capturedAt: string;
}
/**
 * Live configuration of the observe gateway, resolved through the
 * `ai-bridge-observe` user-settings namespace (M4 hot-reload seam). The same
 * channel the P2 router will use to tune policy at runtime.
 */
export interface ObserveConfig {
    /** Ring-buffer capacity; older events are evicted past this limit. */
    readonly maxEvents: number;
    /** Record tool-call events (tools/execute waterfall). */
    readonly captureTools: boolean;
    /** Record LLM-stream events (llm/stream waterfall). */
    readonly captureLlm: boolean;
}
//# sourceMappingURL=types.d.ts.map