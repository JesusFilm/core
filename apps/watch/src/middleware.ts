import createMiddleware from 'next-intl/middleware'

const locales = ['en']

export default createMiddleware({
  // A list of all locales that are supported
  locales,

  // Used when no locale matches
  defaultLocale: 'en',

  // Don't force default locale in pathing
  localePrefix: 'as-needed'
})

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en)/:path*']
}
