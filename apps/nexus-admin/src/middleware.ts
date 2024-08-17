import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { auth } from './auth'

const locales = ['en']

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

  console.log(req.nextUrl.pathname)
  if (req.nextUrl.pathname.startsWith('/api/')) return NextResponse.next()

  const intlResponse = intlMiddleware(req)

  const session = await auth()
  if (
    session !== null ||
    testPathnameRegex(unAuthenticatedPages, req.nextUrl.pathname)
  ) {
    return intlResponse
  }

  const nextUrl = req.nextUrl.clone()
  nextUrl.pathname = authPage

  return NextResponse.redirect(nextUrl, {
    // ...intlResponse,
    status: 301
  })
}

// import { NextRequest } from 'next/server'
// import NextAuth from 'next-auth'

// import { authConfig } from './auth.config'

// const { auth } = NextAuth(authConfig)
// export default auth(async function middleware(req: NextRequest) {
//   // Your custom middleware logic goes here
// })

export const config = { matcher: ['/((?!_next.*\\..*).*)'] }
