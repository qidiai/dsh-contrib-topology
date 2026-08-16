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
        // instead of failing the whole dashboard. Each poll extracts a lightweight
        // detail payload for the expandable card views.
        const [topology, observe, router, orchestrator, mcpBridge] = await Promise.all([
            pollTopology(() => ctx.remote.topology.graph()),
            pollObserve(() => ctx.remote.observe.snapshot()),
            pollRouter(() => ctx.remote.router.profiles()),
            pollOrchestrator(() => ctx.remote.orchestrator.snapshot()),
            pollBridge(() => ctx.remote['mcp-bridge'].snapshot()),
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
/** Best-effort base poll: never rejects (pending on failure). */
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
/** Unwrap a RemoteResult-style payload (value-carrying or plain object). */
function unwrap(result) {
    if (result !== null && typeof result === 'object' && 'value' in result) {
        return result.value;
    }
    return result;
}
/** topology: nodes-per-kind summary + edge count. */
async function pollTopology(call) {
    const base = await poll(call);
    try {
        const result = unwrap(await call());
        const nodes = result.nodes ?? [];
        const summary = {
            plugins: nodes.filter((n) => n.kind === 'plugin').length,
            services: nodes.filter((n) => n.kind === 'service').length,
            subagents: nodes.filter((n) => n.kind === 'subagent').length,
            mcps: nodes.filter((n) => n.kind === 'mcp').length,
            edges: result.edges?.length ?? 0,
        };
        return { ...base, ok: true, detail: `plugin ${summary.plugins} / svc ${summary.services} / sub ${summary.subagents} / mcp ${summary.mcps} / edges ${summary.edges}`, summary };
    }
    catch {
        return base;
    }
}
/** observe: recent timeline events (read-only, no bodies). */
async function pollObserve(call) {
    const base = await poll(call);
    try {
        const result = unwrap(await call());
        const events = (result.events ?? []).slice(0, 15);
        return { ...base, ok: true, detail: `${events.length} recent events`, events };
    }
    catch {
        return base;
    }
}
/** router: provider ranking lines. */
async function pollRouter(call) {
    const base = await poll(call);
    try {
        const result = unwrap(await call());
        const providers = (result.providers ?? []).slice(0, 20);
        return { ...base, ok: true, detail: `${providers.length} providers`, providers };
    }
    catch {
        return base;
    }
}
/** orchestrator: recent dispatch history. */
async function pollOrchestrator(call) {
    const base = await poll(call);
    try {
        const result = unwrap(await call());
        const history = (result.history ?? []).slice(0, 10);
        return { ...base, ok: true, detail: `${history.length} dispatches`, history };
    }
    catch {
        return base;
    }
}
/** mcp-bridge: server status lines. */
async function pollBridge(call) {
    const base = await poll(call);
    try {
        const result = unwrap(await call());
        const servers = result.servers ?? [];
        return { ...base, ok: true, detail: `${servers.length} servers`, servers };
    }
    catch {
        return base;
    }
}
//# sourceMappingURL=index.js.map