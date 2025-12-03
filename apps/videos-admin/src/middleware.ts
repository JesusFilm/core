import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { graphql } from '@core/shared/gql'

import { makeClient } from './libs/apollo/makeClient'
import { authConfig } from './libs/auth'

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
    `^(${pages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  ).test(pathName)
}

const authPage = '/users/sign-in'
const unAuthorizedPage = '/users/unauthorized'
const publicPaths = [authPage, unAuthorizedPage]

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
      maxAge: 12 * 60 * 60 * 24 // Twelve days
    },
    handleValidToken: async ({ token }, headers) => {
      const { data } = await makeClient({
        headers: { Authorization: `JWT ${token}` }
      }).query({
        query: GET_AUTH
      })
      if (data.me?.mediaUserRoles.length === 0) {
        req.nextUrl.pathname = unAuthorizedPage
        return NextResponse.redirect(req.nextUrl)
      }

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
