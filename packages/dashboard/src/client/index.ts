/** Browser client: register the suite dashboard tab into Web Plugins settings. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { DashboardTab, type DashboardTabInjected } from './DashboardTab.tsx'
import { en, zh, NS, type DashboardLocaleKey } from './locales.ts'
import type { DashboardStatus, ObserveEventLite } from '../types.ts'

export type { DashboardTabInjected, DashboardTabProps } from './DashboardTab.tsx'
export type { DashboardLocaleKey } from './locales.ts'
export type { DashboardStatus } from '../types.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Suite dashboard copy. */
    'settings.pluginDashboard': DashboardLocaleKey
  }
}

/** Services required: settings slot, locale, and every suite Remote. */
export const inject = [
  'slots',
  'locale',
  'remote',
  'remote.topology',
  'remote.observe',
  'remote.router',
  'remote.orchestrator',
  'remote.mcp-bridge',
]

/** Contribute the dashboard tab (last in the suite order). */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-dashboard: dictionaries')
  const t = ctx.locale.bind(NS)

  const status: DashboardTabInjected['status'] = async (): Promise<DashboardStatus> => {
    const now = new Date().toISOString()
    // Poll the five suite Remotes; any failure marks its card as pending
    // instead of failing the whole dashboard. Each poll extracts a lightweight
    // detail payload for the expandable card views.
    const [topology, observe, router, orchestrator, mcpBridge] = await Promise.all([
      pollTopology(() => ctx.remote.topology.graph()),
      pollObserve(() => ctx.remote.observe.snapshot()),
      pollRouter(() => ctx.remote.router.profiles()),
      pollOrchestrator(() => ctx.remote.orchestrator.snapshot()),
      pollBridge(() => ctx.remote['mcp-bridge'].snapshot()),
    ])
    return { topology, observe, router, orchestrator, mcpBridge, capturedAt: now }
  }
  const injected = (): DashboardTabInjected => ({ status })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'dashboard',
    order: 70,
    label: () => t('tab'),
    locale: NS,
    inject: injected,
  }, DashboardTab))
}

/** One suite card's base state. */
interface CardState {
  ok: boolean
  detail: string
}

/** Best-effort base poll: never rejects (pending on failure). */
async function poll(call: () => Promise<unknown>): Promise<CardState> {
  try {
    const result = await call()
    const ok = Boolean((result as { ok?: boolean })?.ok)
    return { ok, detail: ok ? 'connected' : 'pending' }
  } catch {
    return { ok: false, detail: 'unavailable' }
  }
}

/** Unwrap a RemoteResult-style payload (value-carrying or plain object). */
function unwrap<T>(result: unknown): T {
  if (result !== null && typeof result === 'object' && 'value' in result) {
    return (result as { value: T }).value
  }
  return result as T
}

/** topology: nodes-per-kind summary + edge count. */
async function pollTopology(call: () => Promise<unknown>): Promise<DashboardStatus['topology']> {
  const base = await poll(call)
  try {
    const result = unwrap<{ nodes?: readonly { kind: string }[]; edges?: readonly unknown[] }>(await call())
    const nodes = result.nodes ?? []
    const summary = {
      plugins: nodes.filter((n) => n.kind === 'plugin').length,
      services: nodes.filter((n) => n.kind === 'service').length,
      subagents: nodes.filter((n) => n.kind === 'subagent').length,
      mcps: nodes.filter((n) => n.kind === 'mcp').length,
      edges: result.edges?.length ?? 0,
    }
    return { ...base, ok: true, detail: `plugin ${summary.plugins} / svc ${summary.services} / sub ${summary.subagents} / mcp ${summary.mcps} / edges ${summary.edges}`, summary }
  } catch {
    return base
  }
}

/** observe: recent timeline events (read-only, no bodies). */
async function pollObserve(call: () => Promise<unknown>): Promise<DashboardStatus['observe']> {
  const base = await poll(call)
  try {
    const result = unwrap<{ events?: readonly ObserveEventLite[] }>(await call())
    const events = (result.events ?? []).slice(0, 15)
    return { ...base, ok: true, detail: `${events.length} recent events`, events }
  } catch {
    return base
  }
}

/** router: provider ranking lines. */
async function pollRouter(call: () => Promise<unknown>): Promise<DashboardStatus['router']> {
  const base = await poll(call)
  try {
    const result = unwrap<{ providers?: DashboardStatus['router']['providers'] }>(await call())
    const providers = (result.providers ?? []).slice(0, 20)
    return { ...base, ok: true, detail: `${providers.length} providers`, providers }
  } catch {
    return base
  }
}

/** orchestrator: recent dispatch history. */
async function pollOrchestrator(call: () => Promise<unknown>): Promise<DashboardStatus['orchestrator']> {
  const base = await poll(call)
  try {
    const result = unwrap<{ history?: DashboardStatus['orchestrator']['history'] }>(await call())
    const history = (result.history ?? []).slice(0, 10)
    return { ...base, ok: true, detail: `${history.length} dispatches`, history }
  } catch {
    return base
  }
}

/** mcp-bridge: server status lines. */
async function pollBridge(call: () => Promise<unknown>): Promise<DashboardStatus['mcpBridge']> {
  const base = await poll(call)
  try {
    const result = unwrap<{ servers?: DashboardStatus['mcpBridge']['servers'] }>(await call())
    const servers = result.servers ?? []
    return { ...base, ok: true, detail: `${servers.length} servers`, servers }
  } catch {
    return base
  }
}
