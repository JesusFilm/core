import { NextRequest, NextResponse } from 'next/server'

import {
  DEFAULT_LOCALE,
  LANGUAGE_MAPPINGS,
  SUPPORTED_LOCALES
} from './src/libs/localeMapping'

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

function getLocaleFromPath(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean)
  const pathParts = parts.slice(1)
  const lastPart = pathParts[pathParts.length - 1]

  const localeEntry = Object.values(LANGUAGE_MAPPINGS).find((mapping) =>
    mapping.languageSlugs.includes(lastPart)
  )

  return localeEntry?.locale
}

function getLocaleFromGeoHeaders(req: NextRequest): string | undefined {
  const country =
    req.headers.get('cf-ipcountry') ||
    req.headers.get('x-vercel-ip-country') ||
    undefined

  if (!country) return undefined

  const countryCode = country.toUpperCase()
  const localeEntry = Object.values(LANGUAGE_MAPPINGS).find((mapping) =>
    mapping.geoLocations.includes(countryCode)
  )

  return localeEntry?.locale
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

function getLocale(req: NextRequest): string {
  // Priority 1: URL Path
  const pathLocale = getLocaleFromPath(req.nextUrl.pathname)
  if (pathLocale != null) return pathLocale

  // Priority 2: Cookie
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value?.split('---')[1]
  if (cookieLocale != null) return cookieLocale

  // Priority 3: Browser Language
  const browserLocale = getBrowserLanguage(req)
  if (browserLocale !== DEFAULT_LOCALE) return browserLocale

  // Priority 4: Geolocation (only check if no other locale found)
  const geoLocale = getLocaleFromGeoHeaders(req)
  return geoLocale ?? DEFAULT_LOCALE
}

export function middleware(req: NextRequest): NextResponse | undefined {
  const isNextInternal = req.nextUrl.pathname.startsWith('/_next')
  const isApi = req.nextUrl.pathname.includes('/api/')
  const isWatchRoute = req.nextUrl.pathname.startsWith('/watch')
  const isAsset = req.nextUrl.pathname.includes('/assets/')

  if (isNextInternal || isApi || !isWatchRoute || isAsset) {
    return
  }

  const locale = getLocale(req)

  if (locale !== DEFAULT_LOCALE) {
    const rewriteUrl = req.nextUrl.clone()
    const cleanPathname = req.nextUrl.pathname.split('?')[0]
    rewriteUrl.pathname = `/${locale}${cleanPathname}`
    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}
