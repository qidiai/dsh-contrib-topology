/** Browser client: register the live topology tab into Web Plugins settings. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { TopologyTab, type TopologyTabInjected } from './TopologyTab.tsx'
import { en, zh, NS, type TopologyLocaleKey } from './locales.ts'

export type { TopologyTabInjected, TopologyTabProps } from './TopologyTab.tsx'
export type { TopologyLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Live plugin dependency topology copy. */
    'settings.pluginTopology': TopologyLocaleKey
  }
}

/** Services required: settings slot, locale, and the generated topology Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.topology']

/** Contribute the lazy topology tab next to the plugin inventory tab. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-topology: dictionaries')

  const t = ctx.locale.bind(NS)
  const graph: TopologyTabInjected['graph'] = async () => {
    const result = await ctx.remote.topology.graph()
    if (!result.ok) {
      throw new Error(`topology.graph failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const injected = (): TopologyTabInjected => ({ graph })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'topology',
    order: 20,
    label: () => t('tab'),
    locale: NS,
    inject: injected,
  }, TopologyTab))
}
