import { graphql } from 'gql.tada'
import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'
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
      mediaUserRoles
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
const unAuthorizedPage = '/user/unauthorized'
const publicPaths = [authPage, unAuthorizedPage]

export default async function middleware(
  req: NextRequest
): Promise<NextResponse<unknown>> {
  if (
    testPathnameRegex(publicPaths, req.nextUrl.pathname) &&
    req.nextUrl.pathname !== authPage
  )
    return intlMiddleware(req)

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
      if (data.me?.mediaUserRoles.length === 0)
        req.nextUrl.pathname = unAuthorizedPage

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
  matcher: ['/api/login', '/api/logout', '/((?!_next|favicon.ico|api|.*\\.).*)']
}
