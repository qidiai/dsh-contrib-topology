/** Browser client: register the routing tab into Web Plugins settings. */
import { RouterTab } from "./RouterTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and the generated router Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.router'];
/** Contribute the routing tab next to the topology/observability tabs. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-router: dictionaries');
    const t = ctx.locale.bind(NS);
    const profiles = async () => {
        const result = await ctx.remote.router.profiles();
        if (!result.ok) {
            throw new Error(`router.profiles failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const rank = async (task, candidates) => {
        const result = await ctx.remote.router.rank(task, candidates);
        if (!result.ok) {
            throw new Error(`router.rank failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const injected = () => ({ profiles, rank });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'router',
        order: 40,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, RouterTab));
}
//# sourceMappingURL=index.js.map