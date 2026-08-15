/**
 * Host-side topology gateway.
 *
 * Reads the Cordis Loader directly on every call (same truth source as
 * dsh's own plugin-inventory) and projects it into a plugin/service graph:
 *
 *   - nodes (plugin) : one per non-group Loader entry
 *   - nodes (service): one per ctx.* key that at least one plugin injects
 *   - edges (injects): plugin → service, from the plugin fiber's inject dict
 *   - edges (contains): parent plugin → child plugin, from the fiber
 *     parent chain (loader tree containment), best-effort
 *
 * Everything fiber-related is guarded: Cordis internals beyond the public
 * inventory projection are semi-private, so a failed read degrades to a
 * flatter graph instead of breaking the snapshot.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { TopologySnapshot } from '../types.ts';
export type * from '../types.ts';
/** Remote-only service exposing the live plugin/service topology graph. */
export declare class TopologyGateway extends TypertRemoteService {
    static inject: string[];
    constructor(ctx: Context);
    /**
     * Read the Loader directly on every call — no second cache to keep in
     * sync with Cordis's own lifecycle events.
     */
    graph(): TopologySnapshot;
}
export default TopologyGateway;
//# sourceMappingURL=index.d.ts.map