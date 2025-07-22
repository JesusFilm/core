import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
  // Typically corresponds to the `[locale]` segment
  const requested = await requestLocale
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale

  return {
    locale,
    messages: (
      await import(
        /* webpackChunkName: "i18nConfig" */
        `../../../../libs/locales/${locale}/apps-watch-modern.json`
      )
    ).default
  }
})
