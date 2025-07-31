import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

// update the fingerprint when updating cookies logic
// update LanguageSwitcher fingerprint as well
export const COOKIE_FINGERPRINT = '00004'

const DEFAULT_LOCALE = 'en'

const SUPPORTED_LOCALES = [
  'en', // English
  'es', // Spanish
  'fr', // French
  'id', // Indonesian
  'th', // Thai
  'ja', // Japanese
  'ko', // Korean
  'ru', // Russian
  'tr', // Turkish
  'zh', // Chinese
  'zh-Hans-CN', // Chinese, Simplified
  'de', // German
  'ne' // Nepali
]

interface LanguagePriority {
  code: string
  priority: number
}

function parseAcceptLanguageHeader(header: string): LanguagePriority[] {
  return header.split(',').map((item) => {
    const [code, priority] = item.trim().split(';')
    const langPriority =
      priority != null ? Number.parseFloat(priority.split('=')[1]) : 1
    return { code, priority: langPriority }
  })
}

function getPreferredLanguage(
  languages: LanguagePriority[] | undefined
): string | undefined {
  const preferredLanguage = languages?.find(
    (language) =>
      SUPPORTED_LOCALES.includes(language.code) ||
      SUPPORTED_LOCALES.includes(language.code.split('-')[0])
  )

  if (preferredLanguage == null) return
  return getSupportedLocale(preferredLanguage?.code)
}

function getSupportedLocale(input?: string): string {
  if (input == null) return DEFAULT_LOCALE

  const languageCode = input.split('-')[0]

  const isSupported = (code: string): boolean =>
    SUPPORTED_LOCALES.includes(code)

  return isSupported(input)
    ? input
    : isSupported(languageCode)
      ? languageCode
      : 'en'
}

function getBrowserLanguage(req: NextRequest): string {
  const acceptedLanguagesHeader = req.headers.get('accept-language')

  if (acceptedLanguagesHeader == null) return DEFAULT_LOCALE

  const acceptedLanguages = parseAcceptLanguageHeader(acceptedLanguagesHeader)
  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )
  return getPreferredLanguage(sortedLanguages) ?? DEFAULT_LOCALE
}

function handleRedirect(req: NextRequest, locale?: string): NextResponse {
  const redirectUrl = new URL(
    `${locale !== DEFAULT_LOCALE ? `/${locale}` : ''}${req.nextUrl.pathname}${
      req.nextUrl.search
    }`,
    req.url
  )
  const response =
    redirectUrl.toString() === req.url.toString()
      ? NextResponse.next()
      : NextResponse.redirect(redirectUrl)
  response.cookies.set('NEXT_LOCALE', `${COOKIE_FINGERPRINT}---${locale}`)
  return response
}

export function middleware(req: NextRequest): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  )
    return

  const nextLocaleCookie = req.cookies
    .get('NEXT_LOCALE')
    ?.value?.split('---')[1]

  // Redirect if NEXT_LOCALE cookie is not set
  if (nextLocaleCookie == null) {
    const browserLanguage = getBrowserLanguage(req)
    return handleRedirect(req, browserLanguage)
  }

  const nextLocale = req.nextUrl.locale
  const extractedLocale = getSupportedLocale(nextLocaleCookie ?? '')

  // Check if the NEXT_LOCALE cookie is set and does not match the current locale
  if (extractedLocale != null && extractedLocale !== nextLocale)
    return handleRedirect(req, extractedLocale)
}
