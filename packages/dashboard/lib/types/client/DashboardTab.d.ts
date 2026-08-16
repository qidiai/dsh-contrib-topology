/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Five expandable cards, one per plugin. Read-only inline views (timeline /
 * ranking / history / servers) for the four data plugins; the topology card
 * shows a per-kind node summary and points to the topology tab for the full
 * SVG graph (which lives in the topology plugin's own tab — no duplicated
 * renderer). Configuration actions stay in each plugin's tab.
 */
import { type ReactNode } from 'react';
import type { DashboardStatus } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface DashboardTabInjected {
    /** Aggregated suite state, assembled from the five plugin Remotes. */
    status(): Promise<DashboardStatus>;
}
/** Full component props assembled by the Settings slot renderer. */
export type DashboardTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginDashboard'> & InjectFace<DashboardTabInjected>;
/** Render the suite dashboard: five expandable cards in one tab. */
export declare function DashboardTab({ status, t }: DashboardTabProps): ReactNode;
//# sourceMappingURL=DashboardTab.d.ts.map