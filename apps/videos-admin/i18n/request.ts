import { hasLocale } from 'next-intl'
import { getRequestConfig } from 'next-intl/server'

const locales = ['en']

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale
  const locale = hasLocale(locales, requested) ? requested : 'en'

  return {
    locale,
    // eslint-disable-next-line import/dynamic-import-chunkname
    messages: (await import(`../src/locales/${locale}/apps-videos-admin.json`))
      .default
  }
})
