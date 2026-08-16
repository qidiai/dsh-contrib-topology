/** Browser client: register the live topology tab into Web Plugins settings. */
import { TopologyTab } from "./TopologyTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and the generated topology Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.topology'];
/** Contribute the lazy topology tab next to the plugin inventory tab. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-topology: dictionaries');
    const t = ctx.locale.bind(NS);
    const graph = async () => {
        const result = await ctx.remote.topology.graph();
        if (!result.ok) {
            throw new Error(`topology.graph failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const injected = () => ({ graph });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'topology',
        order: 20,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, TopologyTab));
}
//# sourceMappingURL=index.js.map