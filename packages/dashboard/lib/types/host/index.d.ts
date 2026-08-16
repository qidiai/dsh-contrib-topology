/**
 * Host-side dashboard gateway.
 *
 * Class-shape placeholder: the suite aggregation lives in the browser half
 * (the Dashboard tab calls the five plugins' Remotes directly). This gateway
 * exists so the dashboard is a regular roster-loadable plugin; it adds no
 * listeners and no services.
 */
import type { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import type { DashboardStatus } from '../types.ts';
export type * from '../types.ts';
/** Remote-only service exposing the suite status (client fills the cards). */
export declare class DashboardGateway extends TypertRemoteService {
    constructor(ctx: Context);
    /** Placeholder aggregation; the client tab composes the real cards. */
    status(): DashboardStatus;
}
export default DashboardGateway;
//# sourceMappingURL=index.d.ts.map