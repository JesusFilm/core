import { notFound } from 'next/navigation'
import { getRequestConfig } from 'next-intl/server'

const isBrowser = typeof window !== 'undefined'

let localePath
if (isBrowser) {
  // browser
  localePath = './public/locales'
} else if (process.env.VERCEL == null || process.env.CI != null) {
  // not vercel or vercel build time
  localePath = '../../libs/locales'
} else {
  // vercel run time
  localePath = './public/locales'
}

// Can be imported from a shared config
export const locales = ['en', 'de']

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale)) notFound()

  return {
    messages: (await import(`${localePath}/${locale}.json`)).default
  }
})
