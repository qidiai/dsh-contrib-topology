/** Browser client: register the observability tab into Web Plugins settings. */
import { ObserveTab } from "./ObserveTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and the generated observe Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.observe'];
/** Contribute the observability tab next to the topology tab. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-observe: dictionaries');
    const t = ctx.locale.bind(NS);
    const snapshot = async () => {
        const result = await ctx.remote.observe.snapshot();
        if (!result.ok) {
            throw new Error(`observe.snapshot failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const injected = () => ({ snapshot });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'observe',
        order: 30,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, ObserveTab));
}
//# sourceMappingURL=index.js.map