import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

let localePath
if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = './locales'
} else {
  // vercel run time
  localePath = require('node:path').resolve('./public/locales')
}

// Can be imported from a shared config
const locales = ['en']

export default getRequestConfig(async ({ locale }: { locale: string }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound()

  return {
    messages: (await import(`${localePath}/${locale}/apps-videos-admin.json`))
      .default
  }
})
