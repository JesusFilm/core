import { NextRequest, NextResponse } from 'next/server'
import { authMiddleware } from 'next-firebase-auth-edge'

import { graphql } from '@core/shared/gql'

import { makeClient } from './libs/apollo/makeClient'
import { authConfig } from './libs/auth'

const GET_AUTH = graphql(`
  query me {
    me {
      id
      __typename
      ... on AuthenticatedUser {
        mediaUserRoles
        languageUserRoles
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

const publisherRole = 'publisher'
const authPage = '/users/sign-in'
const unAuthorizedPage = '/users/unauthorized'
const publicPaths = [authPage, unAuthorizedPage]

export interface PublisherAccess {
  hasMediaPublisher: boolean
  hasLanguagePublisher: boolean
}

export function getPublisherAccess(
  mediaUserRoles: readonly string[] = [],
  languageUserRoles: readonly string[] = []
): PublisherAccess {
  return {
    hasMediaPublisher: mediaUserRoles.includes(publisherRole),
    hasLanguagePublisher: languageUserRoles.includes(publisherRole)
  }
}

function getDefaultPath({
  hasMediaPublisher,
  hasLanguagePublisher
}: PublisherAccess): string {
  if (hasMediaPublisher) return '/videos'
  if (hasLanguagePublisher) return '/languages'
  return unAuthorizedPage
}

function isPathInSection(pathname: string, section: string): boolean {
  return pathname === section || pathname.startsWith(`${section}/`)
}

export function getAuthorizedRedirectPath(
  pathname: string,
  access: PublisherAccess
): string | undefined {
  const { hasMediaPublisher, hasLanguagePublisher } = access

  if (!hasMediaPublisher && !hasLanguagePublisher) return unAuthorizedPage

  const defaultPath = getDefaultPath(access)

  if (pathname === '/') return defaultPath

  if (isPathInSection(pathname, '/languages') && !hasLanguagePublisher) {
    return defaultPath
  }

  if (
    (isPathInSection(pathname, '/videos') ||
      isPathInSection(pathname, '/settings')) &&
    !hasMediaPublisher
  ) {
    return defaultPath
  }

  return undefined
}

export default async function proxy(
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

      const access =
        data.me?.__typename === 'AuthenticatedUser'
          ? getPublisherAccess(
              data.me.mediaUserRoles,
              data.me.languageUserRoles
            )
          : getPublisherAccess()
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
