/**
 * Host-side dashboard gateway.
 *
 * Class-shape placeholder: the suite aggregation lives in the browser half
 * (the Dashboard tab calls the five plugins' Remotes directly). This gateway
 * exists so the dashboard is a regular roster-loadable plugin; it adds no
 * listeners and no services.
 */

import type { Context } from '@deepseek-ai/cordis'
import { TypertRemoteService, Remote } from '@deepseek-ai/dsh-typert-protocol'
// Typert-generated ./typert and ./remote artifacts import Zod at runtime.
import type {} from 'zod'
import type { DashboardStatus } from '../types.ts'

export type * from '../types.ts'

/** Remote-only service exposing the suite status (client fills the cards). */
export class DashboardGateway extends TypertRemoteService {
  constructor(ctx: Context) {
    super(ctx, 'dashboard')
  }

  /** Placeholder aggregation; the client tab composes the real cards. */
  @Remote('status')
  status(): DashboardStatus {
    const now = new Date().toISOString()
    return {
      topology: { ok: false, detail: 'client-side aggregation' },
      observe: { ok: false, detail: 'client-side aggregation' },
      router: { ok: false, detail: 'client-side aggregation' },
      orchestrator: { ok: false, detail: 'client-side aggregation' },
      mcpBridge: { ok: false, detail: 'client-side aggregation' },
      capturedAt: now,
    }
  }
}

export default DashboardGateway
