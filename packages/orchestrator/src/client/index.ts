/** Browser client: register the orchestration tab into Web Plugins settings. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { OrchestratorTab, type OrchestratorTabInjected } from './OrchestratorTab.tsx'
import { en, zh, NS, type OrchestratorLocaleKey } from './locales.ts'

export type { OrchestratorTabInjected, OrchestratorTabProps } from './OrchestratorTab.tsx'
export type { OrchestratorLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Orchestration copy. */
    'settings.pluginOrchestrator': OrchestratorLocaleKey
  }
}

/** Services required: settings slot, locale, and the generated orchestrator Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.orchestrator']

/** Contribute the orchestration tab next to topology/observe/router tabs. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-orchestrator: dictionaries')

  const t = ctx.locale.bind(NS)
  const snapshot: OrchestratorTabInjected['snapshot'] = async () => {
    const result = await ctx.remote.orchestrator.snapshot()
    if (!result.ok) {
      throw new Error(`orchestrator.snapshot failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const dispatch: OrchestratorTabInjected['dispatch'] = async (task, agents, mode) => {
    const result = await ctx.remote.orchestrator.dispatch({
      task,
      ...(agents && agents.length > 0 ? { agents } : {}),
      ...(mode === 'parallel' ? {} : { mode }),
    })
    if (!result.ok) {
      throw new Error(`orchestrator.dispatch failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const injected = (): OrchestratorTabInjected => ({ snapshot, dispatch })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'orchestrator',
    order: 50,
    label: () => t('tab'),
    locale: NS,
    inject: injected,
  }, OrchestratorTab))
}
