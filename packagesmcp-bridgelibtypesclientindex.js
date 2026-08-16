/** Browser client: register the MCP bridge tab into Web Plugins settings. */
import { BridgeTab } from "./BridgeTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and the generated bridge Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.mcp-bridge'];
/** Contribute the bridge tab next to topology/observe/router/orchestrator. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-mcp: dictionaries');
    const t = ctx.locale.bind(NS);
    const snapshot = async () => {
        const result = await ctx.remote['mcp-bridge'].snapshot();
        if (!result.ok) {
            throw new Error(`mcp-bridge.snapshot failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const addServer = async (server) => {
        const result = await ctx.remote['mcp-bridge'].addServer(server);
        if (!result.ok) {
            throw new Error(`mcp-bridge.addServer failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const removeServer = async (serverName) => {
        const result = await ctx.remote['mcp-bridge'].removeServer(serverName);
        if (!result.ok) {
            throw new Error(`mcp-bridge.removeServer failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const injected = () => ({ snapshot, addServer, removeServer });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'mcp-bridge',
        order: 60,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, BridgeTab));
}
//# sourceMappingURL=index.js.map