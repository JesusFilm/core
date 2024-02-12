import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

const supportedLocales = [
  'am', // Amharic
  'ar', // Arabic
  'bn', // Bengali
  'en', // English
  'es', // Spanish
  'fr', // French
  'hi', // Hindi
  'id', // Indonesian
  'ja', // Japanese
  'my', // Burmese
  'ru', // Russian
  'th', // Thai
  'tl', // Tagalog
  'tr', // Turkish
  'ur', // Urdu (Pakistan)
  'vi', // Vietnamese
  'zh-CN', // Chinese, Simplified
  'zh-TW' // Chinese, Traditional
]

function getBrowserLanguage(req): string | undefined {
  const acceptedLanguages = req.headers
    .get('accept-language')
    ?.split(',')
    .map((item) => {
      const [code, priority] = item.trim().split(';')
      const langPriority =
        priority != null ? parseFloat(priority.split('=')[1]) : 1
      return { code, priority: isNaN(langPriority) ? 1 : langPriority }
    })

  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )

  const preferredLanguage = sortedLanguages.find(
    (language) =>
      supportedLocales.includes(language.code) ||
      supportedLocales.includes(language.code.split('-')[0])
  )

  if (preferredLanguage?.code.includes('zh') === true)
    return preferredLanguage.code

  return preferredLanguage != null ? preferredLanguage.code.split('-')[0] : 'en'
}

export function middleware(req: NextRequest): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  )
    return

  const nextLocale = req.nextUrl.locale
  const browserLanguage = getBrowserLanguage(req)
  const nextLocaleCookie = req.cookies.get('NEXT_LOCALE')?.value

  function handleRedirect(locale?: string): NextResponse {
    const redirectUrl = new URL(
      `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
      req.url
    )
    return NextResponse.redirect(redirectUrl)
  }

  const trimmedLocale = nextLocaleCookie?.split('-')[0]

  const matched =
    nextLocaleCookie?.includes('zh') === true
      ? nextLocaleCookie === nextLocale
      : trimmedLocale === nextLocale

  // Redirect if the NEXT_LOCALE cookie is set and does not match the current locale
  if (nextLocaleCookie != null && !matched) {
    if (supportedLocales.includes(nextLocaleCookie)) {
      return handleRedirect(nextLocaleCookie)
    }
    if (trimmedLocale != null && supportedLocales.includes(trimmedLocale)) {
      return handleRedirect(trimmedLocale)
    }
  }

  // Redirect if NEXT_LOCALE cookie is not set and browser language is different from current locale
  if (nextLocaleCookie == null && browserLanguage !== nextLocale) {
    return handleRedirect(browserLanguage)
  }
}
