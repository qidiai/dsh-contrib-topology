/**
 * MCP bridge settings tab — multi-server orchestration view.
 *
 * Lists every bridge-managed MCP server (status + tool count), and lets you
 * add/remove servers at runtime. The host diff-drives mcp-client instances
 * from the `ai-bridge-mcp` settings namespace; this tab is the visible face.
 */
import { type ReactNode } from 'react';
import type { BridgeSnapshot, McpServerConfig } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface BridgeTabInjected {
    /** Fetch the current bridge snapshot (server states). */
    snapshot(): Promise<BridgeSnapshot>;
    /** Add one server at runtime. */
    addServer(server: McpServerConfig): Promise<BridgeSnapshot>;
    /** Remove one server at runtime. */
    removeServer(serverName: string): Promise<BridgeSnapshot>;
}
/** Full component props assembled by the Settings slot renderer. */
export type BridgeTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginMcpBridge'> & InjectFace<BridgeTabInjected>;
/** Render the live MCP server list plus the add/remove controls. */
export declare function BridgeTab({ snapshot, addServer, removeServer, t }: BridgeTabProps): ReactNode;
//# sourceMappingURL=BridgeTab.d.ts.map