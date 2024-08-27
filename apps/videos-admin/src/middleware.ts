import { graphql } from 'gql.tada'
import { NextRequest, NextResponse } from 'next/server'
import NextAuth from 'next-auth'
import createMiddleware from 'next-intl/middleware'

import { signOut } from './auth'
import { authConfig } from './auth.config'
import { makeClient } from './libs/apollo/makeClient'

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

const { auth } = NextAuth(authConfig)

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

const authPage = '/api/auth/signin'
const unAuthenticatedPages = [authPage]

export default async function middleware(
  req: NextRequest
): Promise<NextResponse<unknown>> {
  if (req.nextUrl.pathname === '/api/auth/signIn') {
    const signinUrl = req.nextUrl.clone()
    signinUrl.pathname = '/api/auth/signin'
    return NextResponse.redirect(signinUrl, { status: 301 })
  }

  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next()

  const intlResponse = intlMiddleware(req)

  const session = await auth()
  if (
    session !== null ||
    testPathnameRegex(unAuthenticatedPages, req.nextUrl.pathname)
  ) {
    const { data } = await makeClient({
      headers: {
        authorization: session?.accessToken ?? ''
      }
    }).query({
      query: GET_AUTH
    })
    if (data?.currentVideoRoles?.length === 0) {
      return await signOut()
    }
    return intlResponse
  }

  const nextUrl = req.nextUrl.clone()
  nextUrl.pathname = authPage

  return NextResponse.redirect(nextUrl, {
    // ...intlResponse,
    status: 301
  })
}

export const config = { matcher: ['/((?!_next.*\\..*).*)'] }
