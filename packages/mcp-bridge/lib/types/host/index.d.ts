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
import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { BridgeProbe, BridgeSnapshot, McpServerConfig } from '../types.ts';
export type * from '../types.ts';
/** Remote-only service exposing live MCP server orchestration. */
export declare class McpBridgeGateway extends TypertRemoteService {
    private readonly registry;
    private config;
    constructor(ctx: Context);
    /** Diff the resolved config against live instances; spawn/remove as needed. */
    private applyConfig;
    /** Spawn one mcp-client instance through the cordis plugin registry. */
    private spawn;
    /** All live server states (cheap polling view for the Bridge tab). */
    snapshot(): BridgeSnapshot;
    /** Diagnostic: how visible is the `tools` service from this context? */
    probe(): BridgeProbe;
    /** Best-effort per-server tool counts from the tools service. */
    private toolCounts;
    /** Add one server at runtime (persisted via the ai-bridge-mcp settings). */
    addServer(server: McpServerConfig): Promise<BridgeSnapshot>;
    /** Remove one server at runtime (persisted via the ai-bridge-mcp settings). */
    removeServer(serverName: string): Promise<BridgeSnapshot>;
    /**
     * Persist a full config through the `ai-bridge-mcp` settings channel so a
     * restart re-attaches the servers, then apply the live diff. Falls back to
     * in-memory-only when the settings service is unavailable.
     */
    private persistConfig;
}
export default McpBridgeGateway;
//# sourceMappingURL=index.d.ts.map