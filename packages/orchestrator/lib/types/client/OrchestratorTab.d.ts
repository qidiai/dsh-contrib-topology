/**
 * Orchestrator settings tab — five-mode multi-agent dispatch.
 *
 * Shows aggregate dispatch counters and recent history, and lets you run a
 * dispatch on demand: task text + optional candidate providers + mode.
 */
import { type ReactNode } from 'react';
import type { OrchestratorMode, OrchestratorResult, OrchestratorSnapshot } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface OrchestratorTabInjected {
    /** Fetch the orchestrator snapshot (stats + history). */
    snapshot(): Promise<OrchestratorSnapshot>;
    /** Run one dispatch. */
    dispatch(task: string, agents: string[], mode: OrchestratorMode): Promise<OrchestratorResult>;
}
/** Full component props assembled by the Settings slot renderer. */
export type OrchestratorTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginOrchestrator'> & InjectFace<OrchestratorTabInjected>;
/** Render the live orchestration counters, dispatch box, and history. */
export declare function OrchestratorTab({ snapshot, dispatch, t }: OrchestratorTabProps): ReactNode;
//# sourceMappingURL=OrchestratorTab.d.ts.map