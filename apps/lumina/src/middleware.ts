import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { authConfig } from '@/libs/auth/server-config'

const testPathnameRegex = (pages: string[], pathName: string): boolean => {
  return RegExp(
    `^(${pages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  ).test(pathName)
}

const authPage = '/users/sign-in'
const publicPaths = [authPage, '/users/sign-up']

export default async function middleware(
  req: NextRequest
): Promise<NextResponse<unknown>> {
  if (
    testPathnameRegex(publicPaths, req.nextUrl.pathname) &&
    req.nextUrl.pathname !== authPage
  )
    return NextResponse.next()

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
    handleValidToken: async ({ token }, headers) => {
      return NextResponse.next({ request: { headers } })
    },
    handleInvalidToken: async (_reason) => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname)) {
        req.nextUrl.pathname = authPage
        return NextResponse.redirect(req.nextUrl)
      }
      return NextResponse.next()
    },
    handleError: async () => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname)) {
        req.nextUrl.pathname = authPage
        return NextResponse.redirect(req.nextUrl)
      }
      return NextResponse.next()
    }
  })
}

export const config = {
  matcher: [
    '/api/login',
    '/api/logout',
    '/api/refresh-token',
    '/((?!_next|favicon.ico|api|.*\\.).*)'
  ]
}
