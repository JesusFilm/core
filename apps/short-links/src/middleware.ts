import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'
  ]
}

export function middleware(request: NextRequest) {
  const { hostname, pathname } = request.nextUrl
  const headerHostname = request.headers.get('host')?.split(':')[0]
  const url = new URL(`/${headerHostname ?? hostname}${pathname}`, request.url)
  return NextResponse.rewrite(url)
}
