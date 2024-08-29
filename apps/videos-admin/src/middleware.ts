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
    }
    currentVideoRoles
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
const publicPaths = [authPage]

export default async function middleware(
  req: NextRequest
): Promise<NextResponse<unknown>> {
  if (testPathnameRegex(publicPaths, req.nextUrl.pathname))
    return intlMiddleware(req)

  return await authMiddleware(req, {
    ...authConfig,
    loginPath: '/api/login',
    logoutPath: '/api/logout',
    cookieSerializeOptions: {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
      maxAge: 12 * 60 * 60 * 24 // Twelve days
    },
    handleValidToken: async (token) => {
      // console.log('tokens', token.token)
      const { data } = await makeClient({
        headers: { Authorization: token.token }
      }).query({
        query: GET_AUTH
      })
      console.log('data', data)
      if (data.currentVideoRoles.length === 0) {
        return redirectToLogin(req, {
          path: authPage,
          publicPaths
        })
      }
      return intlMiddleware(req)
    },
    handleInvalidToken: async (reason) => {
      return redirectToLogin(req, {
        path: authPage,
        publicPaths
      })
    },
    handleError: async () => {
      return redirectToLogin(req, {
        path: authPage,
        publicPaths
      })
    }
  })
}

export const config = {
  matcher: ['/api/login', '/api/logout', '/((?!_next|favicon.ico|api|.*\\.).*)']
}
