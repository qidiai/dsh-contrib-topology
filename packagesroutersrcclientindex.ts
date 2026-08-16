/** Browser client: register the routing tab into Web Plugins settings. */

import type {} from '@deepseek-ai/dsh-client-locale/client'
import type { ClientContext } from '@deepseek-ai/dsh-client-runtime/client'
import type {} from '@deepseek-ai/dsh-client-ui-settings/client'
import { RouterTab, type RouterTabInjected } from './RouterTab.tsx'
import { en, zh, NS, type RouterLocaleKey } from './locales.ts'

export type { RouterTabInjected, RouterTabProps } from './RouterTab.tsx'
export type { RouterLocaleKey } from './locales.ts'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** Explainable provider routing copy. */
    'settings.pluginRouter': RouterLocaleKey
  }
}

/** Services required: settings slot, locale, and the generated router Remote. */
export const inject = ['slots', 'locale', 'remote', 'remote.router']

/** Contribute the routing tab next to the topology/observability tabs. */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'ai-bridge-router: dictionaries')

  const t = ctx.locale.bind(NS)
  const profiles: RouterTabInjected['profiles'] = async () => {
    const result = await ctx.remote.router.profiles()
    if (!result.ok) {
      throw new Error(`router.profiles failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const rank: RouterTabInjected['rank'] = async (task, candidates) => {
    const result = await ctx.remote.router.rank(task, candidates)
    if (!result.ok) {
      throw new Error(`router.rank failed: ${result.error.code}: ${result.error.message}`)
    }
    return result.value
  }
  const injected = (): RouterTabInjected => ({ profiles, rank })

  ctx.slots.inject('settings.plugins.tab', () => ctx.slots.register({
    name: 'settings.plugins.tab',
    id: 'router',
    order: 40,
    label: () => t('tab'),
    locale: NS,
    inject: injected,
  }, RouterTab))
}
