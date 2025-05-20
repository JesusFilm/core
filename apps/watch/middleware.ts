import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/
const COOKIE_FINGERPRINT = '00005'
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
  'zh-Hans-CN' // Chinese, Simplified
]

const COUNTRY_TO_LOCALE: Record<string, string> = {
  US: 'en', // United States
  GB: 'en', // United Kingdom
  AU: 'en', // Australia
  CA: 'en', // Canada (default to English)
  ES: 'es', // Spain
  MX: 'es', // Mexico
  AR: 'es', // Argentina
  CO: 'es', // Colombia
  PE: 'es', // Peru
  FR: 'fr', // France
  BE: 'fr', // Belgium (French)
  ID: 'id', // Indonesia
  TH: 'th', // Thailand
  JP: 'ja', // Japan
  JA: 'ja', // Japan (sometimes JP or JA)
  KR: 'ko', // South Korea
  KO: 'ko', // South Korea (sometimes KR or KO)
  RU: 'ru', // Russia
  TR: 'tr', // Turkey
  CN: 'zh', // China (default to Chinese)
  TW: 'zh', // Taiwan (default to Chinese)
  HK: 'zh', // Hong Kong (default to Chinese)
  SG: 'zh-Hans-CN' // Singapore (Simplified Chinese)
  // Add more mappings as needed for your user base
}

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
      : DEFAULT_LOCALE
}

function getLocaleFromGeoHeaders(req: NextRequest): string | undefined {
  const country =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    undefined
  if (!country) return undefined
  const mappedLocale = COUNTRY_TO_LOCALE[country.toUpperCase()]
  return mappedLocale && SUPPORTED_LOCALES.includes(mappedLocale)
    ? mappedLocale
    : undefined
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
    `${locale !== DEFAULT_LOCALE ? `/${locale}` : ''}${req.nextUrl.pathname}${req.nextUrl.search}`,
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
  // Only run for /watch and its subpaths
  if (
    !req.nextUrl.pathname.startsWith('/watch') ||
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  ) {
    return
  }

  const nextLocaleCookie = req.cookies
    .get('NEXT_LOCALE')
    ?.value?.split('---')[1]

  // Redirect if NEXT_LOCALE cookie is not set
  if (nextLocaleCookie == null) {
    // 1. Try geolocation headers
    const geoLocale = getLocaleFromGeoHeaders(req)
    if (geoLocale) {
      return handleRedirect(req, geoLocale)
    }
    // 2. Fallback to browser language
    const browserLanguage = getBrowserLanguage(req)
    return handleRedirect(req, browserLanguage)
  }

  const nextLocale = req.nextUrl.locale
  const extractedLocale = getSupportedLocale(nextLocaleCookie ?? '')

  // Check if the NEXT_LOCALE cookie is set and does not match the current locale
  if (extractedLocale != null && extractedLocale !== nextLocale)
    return handleRedirect(req, extractedLocale)
}
