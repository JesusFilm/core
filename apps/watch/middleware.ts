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

function getBrowserLanguage(req: NextRequest): string {
  const acceptedLanguagesHeader = req.headers.get('accept-language')
  if (acceptedLanguagesHeader == null) return DEFAULT_LOCALE

  const acceptedLanguages = parseAcceptLanguageHeader(acceptedLanguagesHeader)
  const sortedLanguages = acceptedLanguages?.sort(
    (a, b) => b.priority - a.priority
  )
  return getPreferredLanguage(sortedLanguages) ?? DEFAULT_LOCALE
}

interface GetLocaleOptions {
  ignoreLocaleFromPath?: boolean
}

function getLocale(
  req: NextRequest,
  options?: GetLocaleOptions
): string | undefined {
  // Priority 1: Cookie
  const cookieLocale = req.cookies.get('NEXT_LOCALE')?.value?.split('---')[1]
  if (cookieLocale != null) return cookieLocale

  // Priority 2: URL Path
  const pathLocale = getLocaleFromPath(req.nextUrl.pathname)
  if (pathLocale != null && !options?.ignoreLocaleFromPath) return pathLocale

  // Priority 3: Browser Language
  const browserLocale = getBrowserLanguage(req)
  if (browserLocale != null && browserLocale !== DEFAULT_LOCALE)
    return browserLocale
}

export const config = {
  matcher: ['/watch/((?!assets).*)', '/watch']
}

/** Paths that look like static assets; do not rewrite so they are served from public/ */
const STATIC_ASSET_EXT = /\.(svg|png|jpg|jpeg|gif|ico|webp|woff2?|ttf|otf|css|js|map)(\?.*)?$/i

export async function middleware(req: NextRequest): Promise<NextResponse> {
  const pathname = req.nextUrl.pathname

  if (STATIC_ASSET_EXT.test(pathname)) {
    return NextResponse.next()
  }

  const locale = getLocale(req) ?? DEFAULT_LOCALE
  const rewriteUrl = req.nextUrl.clone()

  if (pathname === '/watch' && locale !== DEFAULT_LOCALE) {
    rewriteUrl.pathname = `/watch/${LANGUAGE_MAPPINGS[locale].languageSlugs[0]}`
    return NextResponse.redirect(rewriteUrl, 302)
  }
  if (locale !== DEFAULT_LOCALE) {
    rewriteUrl.pathname = `/${locale}${pathname}`

    return NextResponse.rewrite(rewriteUrl)
  }

  return NextResponse.next()
}
