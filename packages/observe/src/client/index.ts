/** Browser client: register the observability tab into Web Plugins settings. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { ObserveTab, type ObserveTabInjected } from './ObserveTab.tsx'
import { en, zh, NS, type ObserveLocaleKey } from './locales.ts'

export type { ObserveTabInjected, ObserveTabProps } from './ObserveTab.tsx'
export type { ObserveLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Live tool/LLM observation timeline copy. */
    'settings.pluginObserve': ObserveLocaleKey
  }
}

/** Services required: settings slot, locale, and the generated observe Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.observe']

/** Contribute the observability tab next to the topology tab. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-observe: dictionaries')

  const t = ctx.locale.bind(NS)
  const snapshot: ObserveTabInjected['snapshot'] = async () => {
    const result = await ctx.remote.observe.snapshot()
    if (!result.ok) {
      throw new Error(`observe.snapshot failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const injected = (): ObserveTabInjected => ({ snapshot })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'observe',
    order: 30,
    label: () => t('tab'),
    locale: NS,
    inject: injected,
  }, ObserveTab))
}
