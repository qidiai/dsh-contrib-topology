/** Browser client: register the orchestration tab into Web Plugins settings. */
import { OrchestratorTab } from "./OrchestratorTab.js";
import { en, zh, NS } from "./locales.js";
/** Services required: settings slot, locale, and the generated orchestrator Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.orchestrator'];
/** Contribute the orchestration tab next to topology/observe/router tabs. */
export function apply(ctx) {
    ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-orchestrator: dictionaries');
    const t = ctx.locale.bind(NS);
    const snapshot = async () => {
        const result = await ctx.remote.orchestrator.snapshot();
        if (!result.ok) {
            throw new Error(`orchestrator.snapshot failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const dispatch = async (task, agents, mode) => {
        const result = await ctx.remote.orchestrator.dispatch({
            task,
            ...(agents && agents.length > 0 ? { agents } : {}),
            ...(mode === 'parallel' ? {} : { mode }),
        });
        if (!result.ok) {
            throw new Error(`orchestrator.dispatch failed: ${result.error.code}: ${result.error.message}`);
        }
        return result.value;
    };
    const injected = () => ({ snapshot, dispatch });
    ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
        name: 'settings.plugins.tab',
        id: 'orchestrator',
        order: 50,
        label: () => t('tab'),
        locale: NS,
        inject: injected,
    }, OrchestratorTab));
}
//# sourceMappingURL=index.js.map