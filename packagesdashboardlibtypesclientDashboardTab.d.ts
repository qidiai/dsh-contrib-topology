/**
 * Dashboard tab — one view over the whole ai-bridge suite.
 *
 * Aggregates the five plugins' live state by calling their Remotes directly:
 * topology.graph(), observe.snapshot(), router.profiles(),
 * orchestrator.snapshot(), mcp-bridge.snapshot(). Each card shows a compact
 * status line; a refresh button re-polls everything.
 */
import { type ReactNode } from 'react';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface DashboardTabInjected {
    /** Aggregated suite state, assembled from the five plugin Remotes. */
    status(): Promise<DashboardCards>;
}
/** One card's content. */
export interface DashboardCards {
    readonly topology: {
        ok: boolean;
        detail: string;
    };
    readonly observe: {
        ok: boolean;
        detail: string;
    };
    readonly router: {
        ok: boolean;
        detail: string;
    };
    readonly orchestrator: {
        ok: boolean;
        detail: string;
    };
    readonly mcpBridge: {
        ok: boolean;
        detail: string;
    };
    readonly capturedAt: string;
}
/** Full component props assembled by the Settings slot renderer. */
export type DashboardTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginDashboard'> & InjectFace<DashboardTabInjected>;
/** Render the suite dashboard: five status cards in one tab. */
export declare function DashboardTab({ status, t }: DashboardTabProps): ReactNode;
//# sourceMappingURL=DashboardTab.d.ts.map