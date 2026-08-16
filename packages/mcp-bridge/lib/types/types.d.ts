/**
 * Shared contract between the mcp-bridge Host gateway and the Web client.
 *
 * The bridge is an orchestration layer over `@deepseek-ai/dsh-mcp-client`
 * (which is itself a complete bridge: connection, `mcp__` tool registration,
 * reconnect, HMR). Bridge owns: aggregated `servers[]` config via the
 * `ai-bridge-mcp` settings namespace, dynamic spawn/dispose of one mcp-client
 * instance per server, and a status/tool-count view for the Bridge tab.
 */
/** One MCP server entry in the aggregated bridge config. */
export interface McpServerConfig {
    /** Unique namespace; `[A-Za-z0-9_-]{1,32}` (mcp-client validates). */
    readonly serverName: string;
    /** stdio spawns a child process; streamable-http dials a URL. */
    readonly transport: 'stdio' | 'streamable-http';
    /** stdio: executable to spawn. */
    readonly command?: string;
    /** stdio: argument vector. */
    readonly args?: readonly string[];
    /** streamable-http: server URL. */
    readonly url?: string;
}
/** Live status of one bridge-managed server instance. */
export interface BridgeServerState {
    readonly serverName: string;
    readonly status: 'connected' | 'reconnecting' | 'failed' | 'stopped';
    /** Number of `mcp__<serverName>__*` tools registered for this server. */
    readonly toolCount: number;
    readonly lastError?: string;
    readonly updatedAt: string;
}
/** Point-in-time bridge view. */
export interface BridgeSnapshot {
    readonly servers: readonly BridgeServerState[];
    readonly capturedAt: string;
}
/** Aggregated configuration resolved through the `ai-bridge-mcp` settings. */
export interface McpBridgeConfig {
    readonly servers: readonly McpServerConfig[];
}
/** Diagnostic snapshot of tools-service visibility (debugging the inject realm). */
export interface BridgeProbe {
    readonly hasToolsIn: boolean;
    readonly getTools: string;
    readonly propsKeys: readonly string[];
    readonly hasToolsProp: boolean;
    readonly provideOutcome: string;
    readonly postHasToolsProp: boolean;
    readonly fiberRuntime: string;
    readonly extendChildGetTools: string;
    readonly extendChildHasToolsIn: boolean;
}
//# sourceMappingURL=types.d.ts.map