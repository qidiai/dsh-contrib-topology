/** Browser client: register the MCP bridge tab into Web Plugins settings. */
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client';
import { type BridgeLocaleKey } from './locales.ts';
export type { BridgeTabInjected, BridgeTabProps } from './BridgeTab.tsx';
export type { BridgeLocaleKey } from './locales.ts';
declare module '@deepseek-ai/dsh-client-ui-slots' {
    interface LocaleNamespaceMap {
        /** MCP bridge copy. */
        'settings.pluginMcpBridge': BridgeLocaleKey;
    }
}
/** Services required: settings slot, locale, and the generated bridge Remote. */
export declare const inject: string[];
/** Contribute the bridge tab next to topology/observe/router/orchestrator. */
export declare function apply(ctx: ClientContext): void;
//# sourceMappingURL=index.d.ts.map