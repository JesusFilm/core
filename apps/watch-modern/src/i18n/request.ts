import { getRequestConfig } from 'next-intl/server'

import { getUserLocale } from '@/services/locale'

export default getRequestConfig(async () => {
  const locale = await getUserLocale()

  let messages = {}

  try {
    messages = (
      await import(
        /* webpackChunkName: "i18nConfig" */
        `./locales/${locale}/apps-watch-modern.json`
      )
    ).default
  } catch (error) {
    console.warn(`Failed to load messages for locale '${locale}':`, error)
    // Return empty messages object as fallback
  }

  return {
    locale,
    messages
  }
})
