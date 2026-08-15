/**
 * Topology settings tab — dependency-free SVG graph of the live plugin tree.
 *
 * Layout: plugins in the left column (contains-edges indent children under
 * parents), service hubs in the right column, injects-edges as bezier curves.
 * Hover a node to highlight its connected edges; click to pin selection.
 */
import { type ReactNode } from 'react';
import type { TopologySnapshot } from '../types.ts';
import type { InjectFace, PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
export interface TopologyTabInjected {
    /** Fetch a fresh snapshot from the host topology Remote. */
    graph(): Promise<TopologySnapshot>;
}
/** Full component props assembled by the Settings slot renderer. */
export type TopologyTabProps = PropsRuntime<'settings.plugins.tab'> & PropsLocale<'settings.pluginTopology'> & InjectFace<TopologyTabInjected>;
/** Render the live plugin/service dependency topology. */
export declare function TopologyTab({ graph, t }: TopologyTabProps): ReactNode;
//# sourceMappingURL=TopologyTab.d.ts.map