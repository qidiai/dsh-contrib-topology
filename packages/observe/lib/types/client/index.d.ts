/** Browser client: register the observability tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type ObserveLocaleKey } from './locales.ts';
export type { ObserveTabInjected, ObserveTabProps } from './ObserveTab.tsx';
export type { ObserveLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Live tool/LLM observation timeline copy. */
        'settings.pluginObserve': ObserveLocaleKey;
    }
}
/** Services required: settings slot, locale, and the generated observe Remote. */
export declare const inject: string[];
/** Contribute the observability tab next to the topology tab. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map