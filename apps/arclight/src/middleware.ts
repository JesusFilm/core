import { type NextRequest, NextResponse } from 'next/server'

import { createETagResponse } from './lib/etag'

export async function middleware(request: NextRequest) {
  if (!request.nextUrl.pathname.startsWith('/v2')) {
    return NextResponse.next()
  }

  if (request.method !== 'GET') {
    return NextResponse.next()
  }

  const response = await NextResponse.next()

  if (!response.ok) {
    return response
  }

  const body = await response.clone().text()
  const headers: Record<string, string> = {}

  response.headers.forEach((value, key) => {
    headers[key] = value
  })

  headers['vary'] = 'Accept-Encoding, Cookie'

  const contentType = response.headers.get('content-type') ?? ''
  if (contentType.includes('application/json')) {
    headers['cache-control'] = 'public, must-revalidate, max-age=0'
  } else {
    headers['cache-control'] = 'public, must-revalidate, max-age=3600'
  }

  return createETagResponse(request, body, response.status, headers)
}

export const config = {
  matcher: [
    {
      source: '/v2/:path*',
      missing: [
        { type: 'header', key: 'next-router-prefetch' },
        { type: 'header', key: 'purpose', value: 'prefetch' }
      ]
    }
  ]
}
