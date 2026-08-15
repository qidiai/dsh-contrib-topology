/** Browser client: register the live topology tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type TopologyLocaleKey } from './locales.ts';
export type { TopologyTabInjected, TopologyTabProps } from './TopologyTab.tsx';
export type { TopologyLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Live plugin dependency topology copy. */
        'settings.pluginTopology': TopologyLocaleKey;
    }
}
/** Services required: settings slot, locale, and the generated topology Remote. */
export declare const inject: string[];
/** Contribute the lazy topology tab next to the plugin inventory tab. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map