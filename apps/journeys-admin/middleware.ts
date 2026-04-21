import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { authConfig } from './src/libs/auth/config'

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
  'ne', // Nepali
  'ms', // Malay
  'pt' // Portuguese
]

const PUBLIC_PATHS = ['/users/sign-in']

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

function applyLocale(
  req: NextRequest,
  headers?: Headers
): NextResponse | undefined {
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  )
    return headers != null
      ? NextResponse.next({ request: { headers } })
      : NextResponse.next()

  const nextLocaleCookie = req.cookies
    .get('NEXT_LOCALE')
    ?.value?.split('---')[1]

  // Redirect if NEXT_LOCALE cookie is not set
  if (nextLocaleCookie == null) {
    const browserLanguage = getBrowserLanguage(req)
    return handleLocaleRedirect(req, browserLanguage, headers)
  }

  const nextLocale = req.nextUrl.locale
  const extractedLocale = getSupportedLocale(nextLocaleCookie ?? '')

  if (extractedLocale != null && extractedLocale !== nextLocale)
    return handleLocaleRedirect(req, extractedLocale, headers)

  return headers != null
    ? NextResponse.next({ request: { headers } })
    : NextResponse.next()
}

function handleLocaleRedirect(
  req: NextRequest,
  locale: string | undefined,
  headers?: Headers
): NextResponse {
  const redirectUrl = new URL(
    `${locale !== DEFAULT_LOCALE ? `/${locale}` : ''}${req.nextUrl.pathname}${
      req.nextUrl.search
    }`,
    req.url
  )
  const isSameUrl = redirectUrl.toString() === req.url.toString()
  const isRedirect = !isSameUrl
  if (isRedirect && headers != null) {
    console.warn(
      '[NES-1460-diag] locale redirect dropping auth-decorated headers',
      {
        from: req.nextUrl.pathname,
        to: redirectUrl.pathname,
        locale
      }
    )
  }
  const response = isSameUrl
    ? headers != null
      ? NextResponse.next({ request: { headers } })
      : NextResponse.next()
    : NextResponse.redirect(redirectUrl)
  response.cookies.set('NEXT_LOCALE', `${COOKIE_FINGERPRINT}---${locale}`)
  return response
}

function isPublicPath(req: NextRequest): boolean {
  const pathname = req.nextUrl.pathname
  return PUBLIC_PATHS.some(
    (p) =>
      pathname === p ||
      pathname.match(
        new RegExp(
          `^/[a-z]{2}(-[A-Za-z]+(-[A-Za-z]+)?)?${p.replace('/', '\\/')}$`
        )
      )
  )
}

export default async function middleware(
  req: NextRequest
): Promise<NextResponse> {
  return await authMiddleware(req, {
    ...authConfig,
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    refreshTokenPath: '/api/refresh-token',
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24
    },
    handleValidToken: async (_tokens, headers) => {
      return applyLocale(req, headers) ?? NextResponse.next()
    },
    handleInvalidToken: async () => {
      return applyLocale(req) ?? NextResponse.next()
    },
    handleError: async (error) => {
      console.error('[NES-1460-diag] middleware auth error', {
        pathname: req.nextUrl.pathname,
        errorMessage: error instanceof Error ? error.message : String(error)
      })
      return applyLocale(req) ?? NextResponse.next()
    }
  })
}

export const config = {
  matcher: [
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    '/((?!_next|favicon.ico|__nextjs).*)'
  ]
}
