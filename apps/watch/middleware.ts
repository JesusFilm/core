import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_FILE_REGEX = /\.(.*)$/

// Define the fingerprint for cookie versioning
export const COOKIE_FINGERPRINT = '00001'

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

// Routes that should have internationalization
const I18N_ROUTES = ['/watch/easter']

// Strict check if a path starts with a supported locale
function hasLocalePrefix(pathname: string): boolean {
  if (!pathname || pathname === '/') return false

  const segments = pathname.split('/')
  // Only consider the first path segment (index 1, since index 0 is empty due to leading slash)
  return segments.length > 1 && SUPPORTED_LOCALES.includes(segments[1])
}

// Check if a path should be internationalized (without locale consideration)
function isI18nRoute(pathname: string): boolean {
  // First, handle case where pathname already has locale prefix
  if (hasLocalePrefix(pathname)) {
    const segments = pathname.split('/')
    // Remove the locale segment and check the rest of the path
    const pathWithoutLocale = '/' + segments.slice(2).join('/')
    return I18N_ROUTES.some((route) => pathWithoutLocale.startsWith(route))
  }

  // For paths without locale prefix, check directly
  return I18N_ROUTES.some((route) => pathname.startsWith(route))
}

// Safely extract locale from cookie
function extractLocaleFromCookie(req: NextRequest): string {
  try {
    const localeCookie = req.cookies.get('NEXT_LOCALE')
    if (localeCookie && localeCookie.value) {
      const cookieValue = localeCookie.value
      if (cookieValue.includes('---')) {
        const localePart = cookieValue.split('---')[1]
        if (SUPPORTED_LOCALES.includes(localePart)) {
          return localePart
        }
      }
    }
  } catch (e) {
    // Error extracting locale from cookie
  }

  return DEFAULT_LOCALE
}

export function middleware(req: NextRequest): NextResponse | undefined {
  // Skip processing for non-page requests, static assets, API routes, etc.
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.includes('/api/') ||
    PUBLIC_FILE_REGEX.test(req.nextUrl.pathname)
  ) {
    return
  }

  const pathname = req.nextUrl.pathname

  // CRITICAL CHECK: Determine if the path already has a locale prefix
  const hasLocale = hasLocalePrefix(pathname)

  // If the path already has a locale prefix, just pass it through
  if (hasLocale) {
    return NextResponse.next()
  }

  // Check if this is a route that should be internationalized
  if (!isI18nRoute(pathname)) {
    return NextResponse.next()
  }

  // Get the preferred locale from cookie or default to English
  const preferredLocale = extractLocaleFromCookie(req)

  // Build the redirect URL with locale prefix
  const redirectUrl = `/${preferredLocale}${pathname}${req.nextUrl.search}`

  // Create the full URL for comparison
  const targetUrl = new URL(redirectUrl, req.url)
  const currentUrl = new URL(req.url)

  // CRITICAL: Compare the current URL with the URL we would redirect to
  // This prevents redirect loops by not redirecting if we're already at the target URL
  if (targetUrl.toString() === currentUrl.toString()) {
    return NextResponse.next()
  }

  // Use temporary redirect (307) to avoid browser caching
  const response = NextResponse.redirect(targetUrl, 307)

  // Set the locale cookie
  response.cookies.set(
    'NEXT_LOCALE',
    `${COOKIE_FINGERPRINT}---${preferredLocale}`
  )

  // Add debug headers
  response.headers.set('x-middleware-action', 'redirect')
  response.headers.set('x-original-path', pathname)
  response.headers.set('x-redirected-to', redirectUrl)

  return response
}

// Narrow the matcher to only include routes we want to internationalize
// WITHOUT locale prefixes
export const config = {
  matcher: [
    // Only match /watch/easter without locale prefix
    '/watch/easter',
    '/watch/easter/:path*'
  ]
}
