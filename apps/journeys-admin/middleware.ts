import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

// update the fingerprint when updating cookies logic
const COOKIE_FINGERPRINT = '00001'

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
  'vi', // Vietnamese,
  'zh', // Chinese
  'zh-CN', // Chinese, Simplified
  'zh-TW' // Chinese, Traditional
]

interface LanguagePriority {
  code: string
  priority: number
}

function parseAcceptLanguageHeader(header: string): LanguagePriority[] {
  return header.split(',').map((item) => {
    const [code, priority] = item.trim().split(';')
    const langPriority =
      priority != null ? parseFloat(priority.split('=')[1]) : 1
    return { code, priority: isNaN(langPriority) ? 1 : langPriority }
  })
}

function getPreferredLanguage(
  languages: LanguagePriority[] | undefined
): string {
  const preferredLanguage = languages?.find(
    (language) =>
      supportedLocales.includes(language.code) ||
      supportedLocales.includes(language.code.split('-')[0])
  )
  return preferredLanguage?.code.includes('zh') === true
    ? preferredLanguage.code
    : preferredLanguage != null
    ? preferredLanguage.code.split('-')[0]
    : 'en'
}

function getBrowserLanguage(req: NextRequest): string | undefined {
  const acceptedLanguagesHeader = req.headers.get('accept-language')

  if (acceptedLanguagesHeader == null) return
  const acceptedLanguages = parseAcceptLanguageHeader(acceptedLanguagesHeader)
  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )
  return getPreferredLanguage(sortedLanguages)
}

function handleRedirect(
  req: NextRequest,
  locale?: string,
  updateCookie?: boolean
): NextResponse {
  const redirectUrl = new URL(
    `/${locale}${req.nextUrl.pathname}${req.nextUrl.search}`,
    req.url
  )
  const response = NextResponse.redirect(redirectUrl)
  response.cookies.set('NEXT_LOCALE', `${COOKIE_FINGERPRINT}-${locale}`)
  return response
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
  const extractedLocale = nextLocaleCookie?.slice(6)

  // Redirect if NEXT_LOCALE cookie is not set
  if (nextLocaleCookie == null) {
    return handleRedirect(req, browserLanguage)
  }

  // Check if the NEXT_LOCALE cookie is set and does not match the current locale
  if (
    extractedLocale !== nextLocale &&
    (supportedLocales.includes(extractedLocale as string) ||
      supportedLocales.includes(extractedLocale?.split('-')[0] as string))
  ) {
    const trimmedLocale = extractedLocale?.split('-')[0]
    return handleRedirect(req, trimmedLocale)
  }
}
