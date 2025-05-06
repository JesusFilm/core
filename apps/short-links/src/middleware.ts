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
  const hostname = request.nextUrl.hostname
  const pathname = request.nextUrl.pathname

  // Handle by convention redirects for arc.gt and stage.arc.gt
  if (hostname === 'arc.gt' || hostname === 'stg.arc.gt') {
    if (
      pathname.startsWith('/hls/') ||
      pathname.startsWith('/dl/') ||
      pathname.startsWith('/dh/') ||
      pathname.startsWith('/s/')
    ) {
      const baseUrl =
        hostname === 'arc.gt'
          ? 'https://api.arclight.org'
          : 'https://core-stage.arclight.org'

      const parts = pathname.split('/')
      if (parts.length !== 4) {
        return new NextResponse('Invalid URL format', { status: 400 })
      }

      const [, type, param1, param2] = parts

      switch (type) {
        case 'hls':
          return NextResponse.redirect(
            `${baseUrl}/hls/${param1}/${param2}`,
            307
          )
        case 'dl':
          return NextResponse.redirect(`${baseUrl}/dl/${param1}/${param2}`, 307)
        case 'dh':
          return NextResponse.redirect(`${baseUrl}/dh/${param1}/${param2}`, 307)
        case 's':
          return NextResponse.redirect(`${baseUrl}/s/${param1}/${param2}`, 307)
      }
    }
  }

  const url = new URL(`/${hostname}${pathname}`, request.url)
  return NextResponse.rewrite(url)
}
