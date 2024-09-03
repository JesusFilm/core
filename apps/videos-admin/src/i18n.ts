import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

import { locales } from './i18n/config'

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound()

  return {
    messages: (
      await import(
        /* webpackChunkName: "locales-apps-video-admin" */
        `./locales/${locale}/apps-videos-admin.json`
      )
    ).default
  }
})
