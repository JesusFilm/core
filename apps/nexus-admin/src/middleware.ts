import { NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'

import { auth } from './libs/auth/auth'

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

const unAuthenticatedPages = ['/user/login']

export default async function middleware(req: NextRequest) {
  const intlResponse = intlMiddleware(req)

  const session = await auth()
  if (
    session !== null ||
    testPathnameRegex(unAuthenticatedPages, req.nextUrl.pathname)
  ) {
    return intlResponse
  }

  const nextUrl = req.nextUrl.clone()
  nextUrl.pathname = '/user/login'

  return NextResponse.redirect(nextUrl, {
    ...intlResponse,
    status: 301
  })
}

export const config = { matcher: ['/((?!_next|.*\\..*).*)'] }
