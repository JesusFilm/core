import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { graphql } from '@core/shared/gql'

import {
  AUTH_PAGE,
  UNAUTHORIZED_PAGE,
  getAuthorizedRedirectPath,
  getShortLinkAccess
} from './libs/access'
import { makeClient } from './libs/apollo/makeClient'
import { authConfig } from './libs/auth'

const GET_AUTH = graphql(`
  query me {
    me {
      id
      __typename
      ... on AuthenticatedUser {
        mediaUserRoles
        superAdmin
      }
    }
  }
`)

const testPathnameRegex = (pages: string[], pathName: string): boolean => {
  return RegExp(
    `^(${pages.flatMap((p) => (p === '/' ? ['', '/'] : p)).join('|')})/?$`,
    'i'
  ).test(pathName)
}

const publicPaths = [AUTH_PAGE, UNAUTHORIZED_PAGE]

export default async function proxy(
  req: NextRequest
): Promise<NextResponse<unknown>> {
  if (
    testPathnameRegex(publicPaths, req.nextUrl.pathname) &&
    req.nextUrl.pathname !== AUTH_PAGE
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

      const access =
        data?.me?.__typename === 'AuthenticatedUser'
          ? getShortLinkAccess(data.me.mediaUserRoles, data.me.superAdmin)
          : getShortLinkAccess()
      const redirectPath = getAuthorizedRedirectPath(
        req.nextUrl.pathname,
        access
      )

      if (redirectPath != null) {
        req.nextUrl.pathname = redirectPath
        return NextResponse.redirect(req.nextUrl)
      }

      return NextResponse.next({ request: { headers } })
    },
    handleInvalidToken: async (_reason) => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname)) {
        req.nextUrl.pathname = AUTH_PAGE
        return NextResponse.redirect(req.nextUrl)
      }
      return NextResponse.next()
    },
    handleError: async () => {
      if (!testPathnameRegex(publicPaths, req.nextUrl.pathname)) {
        req.nextUrl.pathname = AUTH_PAGE
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
