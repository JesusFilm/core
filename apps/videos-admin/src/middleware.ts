import { graphql } from 'gql.tada'
import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware, redirectToLogin } from 'next-firebase-auth-edge'
import createMiddleware from 'next-intl/middleware'

import { makeClient } from './libs/apollo/makeClient'
import { authConfig } from './libs/auth'

const locales = ['en']

const GET_AUTH = graphql(`
  query me {
    me {
      id
      email
      firstName
      lastName
      imageUrl
      videoRoles
    }
  }
`)

const testPathnameRegex = (pages: string[], pathName: string): boolean => {
  return RegExp(
    `^(/(${locales.join('|')}))?(${pages
      .flatMap((p) => (p === '/' ? ['', '/'] : p))
      .join('|')})/?$`,
    'i'
  ).test(pathName)
}

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale: 'en'
})

const authPage = '/user/signin'
const publicPaths = [authPage, '/user/unauthorized']

export default async function middleware(
  req: NextRequest
): Promise<NextResponse<unknown>> {
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
      maxAge: 12 * 60 * 60 * 24 // Twelve days
    },
    handleValidToken: async (token) => {
      const { data } = await makeClient({
        headers: { Authorization: token.token }
      }).query({
        query: GET_AUTH
      })
      console.log('data', data.me)
      if (data.me?.videoRoles.length === 0)
        req.nextUrl.pathname = '/user/unauthorized'

      return intlMiddleware(req)
    },
    handleInvalidToken: async (reason) => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname))
        req.nextUrl.pathname = authPage
      return intlMiddleware(req)
    },
    handleError: async () => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname))
        req.nextUrl.pathname = authPage
      return intlMiddleware(req)
    }
  })
}

export const config = {
  matcher: [
    '/api/login',
    '/api/logout',
    `/${locales.join('|')}/:path*`,
    '/((?!_next|favicon.ico|api|.*\\.).*)'
  ]
}
