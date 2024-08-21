import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

// Can be imported from a shared config
const locales = ['en']

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound()

  return {
    // eslint-disable-next-line import/dynamic-import-chunkname
    messages: (await import(`./locales/${locale}/apps-videos-admin.json`))
      .default
  }
})
