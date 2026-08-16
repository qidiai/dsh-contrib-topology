/**
 * Shared contract between the mcp-bridge Host gateway and the Web client.
 *
 * The bridge is an orchestration layer over `@deepseek-ai/dsh-mcp-client`
 * (which is itself a complete bridge: connection, `mcp__` tool registration,
 * reconnect, HMR). Bridge owns: aggregated `servers[]` config via the
 * `ai-bridge-mcp` settings namespace, dynamic spawn/dispose of one mcp-client
 * instance per server, and a status/tool-count view for the Bridge tab.
 */
export {};
//# sourceMappingURL=types.js.map