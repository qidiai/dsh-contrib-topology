/** Browser client: register the suite dashboard tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type DashboardLocaleKey } from './locales.ts';
export type { DashboardTabInjected, DashboardTabProps } from './DashboardTab.tsx';
export type { DashboardLocaleKey } from './locales.ts';
export type { DashboardStatus } from '../types.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** Suite dashboard copy. */
        'settings.pluginDashboard': DashboardLocaleKey;
    }
}
/** Services required: settings slot, locale, and every suite Remote. */
export declare const inject: string[];
/** Contribute the dashboard tab (last in the suite order). */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map