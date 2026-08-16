/** Browser client: register the orchestration tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type OrchestratorLocaleKey } from './locales.ts';
export type { OrchestratorTabInjected, OrchestratorTabProps } from './OrchestratorTab.tsx';
export type { OrchestratorLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Orchestration copy. */
        'settings.pluginOrchestrator': OrchestratorLocaleKey;
    }
}
/** Services required: settings slot, locale, and the generated orchestrator Remote. */
export declare const inject: string[];
/** Contribute the orchestration tab next to topology/observe/router tabs. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map