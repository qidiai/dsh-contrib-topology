/**
 * Observability settings tab — newest-first timeline of tool calls and LLM
 * streams captured by the host gateway. M2 adds kind/outcome filtering and
 * groups the timeline into tool-call and LLM-stream sections (M1 was a flat
 * list); M3 grows the stats header into a full panel.
 */
import { type ReactNode } from 'react';
import type { ObserveSnapshot } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface ObserveTabInjected {
    /** Fetch a fresh observation window from the host observe Remote. */
    snapshot(): Promise<ObserveSnapshot>;
}
/** Full component props assembled by the Settings slot renderer. */
export type ObserveTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginObserve'> & InjectFace<ObserveTabInjected>;
/** Render the live tool/LLM observation timeline with filters and grouping. */
export declare function ObserveTab({ snapshot, t }: ObserveTabProps): ReactNode;
//# sourceMappingURL=ObserveTab.d.ts.map