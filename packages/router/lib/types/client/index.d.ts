/** Browser client: register the routing tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type RouterLocaleKey } from './locales.ts';
export type { RouterTabInjected, RouterTabProps } from './RouterTab.tsx';
export type { RouterLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Explainable provider routing copy. */
        'settings.pluginRouter': RouterLocaleKey;
    }
}
/** Services required: settings slot, locale, and the generated router Remote. */
export declare const inject: string[];
/** Contribute the routing tab next to the topology/observability tabs. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map