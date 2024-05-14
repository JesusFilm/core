import acceptLanguage from 'accept-language'
import { NextRequest, NextResponse } from 'next/server'

import { cookieName, fallbackLng, languages } from './i18n.settings'

acceptLanguage.languages(languages)

export function middleware(req: NextRequest): NextResponse {
  let lng
  const cookieValue = req.cookies.get(cookieName)?.value
  if (cookieValue != null) lng = acceptLanguage.get(cookieValue)
  if (lng == null) lng = acceptLanguage.get(req.headers.get('Accept-Language'))
  if (lng == null) lng = fallbackLng

  // Redirect if lng in path is not supported
  if (
    !languages.some((loc) => req.nextUrl.pathname.startsWith(`/${loc}`)) &&
    !req.nextUrl.pathname.startsWith('/_next')
  ) {
    return NextResponse.redirect(
      new URL(`/${lng}${req.nextUrl.pathname}`, req.url)
    )
  }

  if (req.headers.has('referer')) {
    const refererUrl = new URL(req.headers.get('referer') ?? '')
    const lngInReferer = languages.find((l) =>
      refererUrl.pathname.startsWith(`/${l}`)
    )
    const response = NextResponse.next()
    if (lngInReferer != null) response.cookies.set(cookieName, lngInReferer)
    return response
  }

  return NextResponse.next()
}

export const config = {
  // matcher: '/:lng*'
  matcher: [
    '/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)'
  ]
}
