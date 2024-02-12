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
  'zh-TW', // Chinese, Traditional
  'zh-HK' // Chinese, Traditional (Hongkong)
]

const getBrowserLanguage = (req): string | undefined => {
  const acceptedLanguages = req.headers
    .get('accept-language')
    ?.split(',')
    .map((item) => {
      const [code, priority] = item.trim().split(';')
      const trimmedCode = code.includes('zh') === true ? code : code.slice(0, 2)
      const langPriority =
        priority != null ? parseFloat(priority.split('=')[1]) : 1
      return { trimmedCode, priority: isNaN(langPriority) ? 1 : langPriority }
    })

  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )

  if (sortedLanguages != null && sortedLanguages.length > 0) {
    const browserCode = sortedLanguages[0].trimmedCode
    if (supportedLocales.includes(browserCode)) {
      return browserCode
    }
  }
  return 'en'
}

export function middleware(req: NextRequest): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  ) {
    return
  }

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

  // Redirect if the NEXT_LOCALE cookie is set and does not match the current locale
  if (nextLocaleCookie != null && nextLocaleCookie !== nextLocale) {
    return handleRedirect(nextLocaleCookie)
  }

  // Redirect if NEXT_LOCALE cookie is not set and browser language is different from current locale
  if (nextLocaleCookie == null && browserLanguage !== nextLocale) {
    return handleRedirect(browserLanguage)
  }
}
