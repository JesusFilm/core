import { NextRequest, NextResponse } from 'next/server'

const UNAUTHORIZED_RESPONSE = {
  status: 401,
  headers: { 'WWW-Authenticate': 'Basic realm="Restricted API"' }
} as const

const decodeCredentials = (encoded: string): string | undefined => {
  try {
    if (typeof globalThis.atob === 'function') {
      return globalThis.atob(encoded)
    }

    return Buffer.from(encoded, 'base64').toString('utf-8')
  } catch {
    return undefined
  }
}

const unauthorized = () =>
  new NextResponse('Auth required', {
    ...UNAUTHORIZED_RESPONSE
  })

export function middleware(req: NextRequest): NextResponse {
  const username = process.env.BASIC_AUTH_USER
  const password = process.env.BASIC_AUTH_PASS

  if (!username || !password) {
    return NextResponse.next()
  }

  const authHeader = req.headers.get('authorization')

  if (!authHeader) {
    return unauthorized()
  }

  const [scheme, encoded] = authHeader.split(' ')

  if (scheme !== 'Basic' || encoded == null) {
    return unauthorized()
  }

  const decoded = decodeCredentials(encoded)

  if (decoded == null) {
    return unauthorized()
  }

  const separatorIndex = decoded.indexOf(':')

  if (separatorIndex === -1) {
    return unauthorized()
  }

  const providedUser = decoded.slice(0, separatorIndex)
  const providedPassword = decoded.slice(separatorIndex + 1)

  if (providedUser !== username || providedPassword !== password) {
    return unauthorized()
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/api/:path*']
}
