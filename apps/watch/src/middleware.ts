import acceptLanguage from 'accept-language'
import { RequestCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { NextRequest, NextResponse } from 'next/server'

import { cookieName, fallbackLanguageId, languages } from './libs/il8n/settings'

acceptLanguage.languages(languages)

export const config = {
  // matcher: '/:lng*'
  matcher: [
    '/((?!api|fonts|locales|_next/static|_next/image|assets|favicon.ico|site.webmanifest|sw.js").*)',
    '/'
  ]
}

export function middleware(req: NextRequest): NextResponse {
  let languageId
  if (req.cookies.has(cookieName))
    languageId = acceptLanguage.get(
      (req.cookies.get(cookieName) as RequestCookie).value
    )
  if (languageId == null)
    languageId = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (languageId == null) languageId = fallbackLanguageId

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${languageId}${req.nextUrl.pathname}`, req.url)
    )
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer') as string)
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    )
    const response = NextResponse.next()
    if (lngInReferer != null) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next()
}
