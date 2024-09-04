import { NextRequest, NextResponse } from 'next/server'
import createIntlMiddleware from 'next-intl/middleware'

import { auth } from './auth'
import { defaultLocale, localePrefix, locales } from './i18n/config'

interface AppRouteHandlerFnContext {
  params?: Record<string, string | string[]>
}

const intlMiddleware = createIntlMiddleware({
  locales,
  defaultLocale,
  localePrefix
})

const authPages = ['/auth/login']

const getPathnameRegex = (pages: string[]): RegExp =>
  RegExp(
    `^(/(${locales.join('|')}))?(${pages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  )

const authPathnameRegex = getPathnameRegex(authPages)

async function authMiddleware(
  request: NextRequest,
  ctx: AppRouteHandlerFnContext
  // eslint-disable-next-line @typescript-eslint/no-invalid-void-type
): Promise<void | Response> {
  return await auth((req) => {
    const path = req.nextUrl.pathname
    const isAuth = req.auth != null

    const isAuthPage = authPathnameRegex.test(path)

    if (isAuth && isAuthPage)
      return NextResponse.redirect(new URL('/', req.url))

    if (!isAuth && !isAuthPage)
      return NextResponse.redirect(new URL('/auth/login', req.url))

    return intlMiddleware(request)
  })(request, ctx)
}

export default function middleware(
  request: NextRequest,
  ctx: AppRouteHandlerFnContext
): NextResponse {
  return authMiddleware(request, ctx) as unknown as NextResponse
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
}
