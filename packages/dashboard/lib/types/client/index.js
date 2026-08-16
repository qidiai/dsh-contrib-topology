/** Browser client: register the suite dashboard tab into Web Plugins settings. */
import { DashboardTab } from "./DashboardTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and every suite Remote. */
export const inject = [
    'slots',
    'locale',
    'remote',
    'remote.topology',
    'remote.observe',
    'remote.router',
    'remote.orchestrator',
    'remote.mcp-bridge',
];
/** Contribute the dashboard tab (last in the suite order). */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-dashboard: dictionaries');
    const t = ctx.locale.bind(NS);
    const status = async () => {
        const now = new Date().toISOString();
        // Poll the five suite Remotes; any failure marks its card as pending
        // instead of failing the whole dashboard.
        const [topology, observe, router, orchestrator, mcpBridge] = await Promise.all([
            poll(() => ctx.remote.topology.graph()),
            poll(() => ctx.remote.observe.snapshot()),
            poll(() => ctx.remote.router.profiles()),
            poll(() => ctx.remote.orchestrator.snapshot()),
            poll(() => ctx.remote['mcp-bridge'].snapshot()),
        ]);
        return { topology, observe, router, orchestrator, mcpBridge, capturedAt: now };
    };
    const injected = () => ({ status });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'dashboard',
        order: 70,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, DashboardTab));
}
/** Best-effort poll: one card, never rejects (pending on failure). */
async function poll(call) {
    try {
        const result = await call();
        const ok = Boolean(result?.ok);
        return { ok, detail: ok ? 'connected' : 'pending' };
    }
    catch {
        return { ok: false, detail: 'unavailable' };
    }
}
//# sourceMappingURL=index.js.map