import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

// update the fingerprint when updating cookies logic
const COOKIE_FINGERPRINT = '00002'

const supportedLocales = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'id', // Indonesian
  'ja', // Japanese
  'ru', // Russian
  'tr', // Turkish
  'zh', // Chinese
  'zh-Hans-CN' // Chinese, Simplified
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
    return { code, priority: langPriority }
  })
}

function getPreferredLanguage(
  languages: LanguagePriority[] | undefined
): string | undefined {
  const preferredLanguage = languages?.find(
    (language) =>
      supportedLocales.includes(language.code) ||
      supportedLocales.includes(language.code.split('-')[0])
  )

  if (preferredLanguage == null) return
  return getSupportedLocale(preferredLanguage?.code)
}

function getSupportedLocale(input: string): string {
  const languageCode = input.split('-')[0]

  const isSupported = (code: string): boolean => supportedLocales.includes(code)

  return isSupported(input)
    ? input
    : isSupported(languageCode)
    ? languageCode
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

function handleRedirect(req: NextRequest, locale?: string): NextResponse {
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
  const extractedLocale = getSupportedLocale(nextLocaleCookie?.slice(6) ?? '')

  // Redirect if NEXT_LOCALE cookie is not set
  if (nextLocaleCookie == null) {
    return handleRedirect(req, browserLanguage)
  }

  // Check if the NEXT_LOCALE cookie is set and does not match the current locale
  if (extractedLocale != null && extractedLocale !== nextLocale) {
    return handleRedirect(req, extractedLocale)
  }
}
