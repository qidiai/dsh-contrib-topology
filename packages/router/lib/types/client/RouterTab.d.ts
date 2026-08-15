/**
 * Router settings tab — explainable subagent-provider routing.
 *
 * Shows the observed provider profiles (calls/success/confidence/freshness)
 * and lets you score/rank providers for a task description, with per-dimension
 * components and a plain-language reason for each candidate.
 */
import { type ReactNode } from 'react';
import type { RouterRankResult, RouterSnapshot } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface RouterTabInjected {
    /** Fetch all observed provider profiles. */
    profiles(): Promise<RouterSnapshot>;
    /** Score/rank providers for one task. */
    rank(task: string, candidates?: readonly string[]): Promise<RouterRankResult>;
}
/** Full component props assembled by the Settings slot renderer. */
export type RouterTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginRouter'> & InjectFace<RouterTabInjected>;
/** Render the live provider routing profiles and task ranking. */
export declare function RouterTab({ profiles, rank, t }: RouterTabProps): ReactNode;
//# sourceMappingURL=RouterTab.d.ts.map