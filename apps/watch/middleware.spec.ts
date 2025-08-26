import { NextRequest, NextResponse } from 'next/server'

import { middleware } from './middleware'

const createMockRequest = (
  pathname: string,
  options: {
    cookies?: { name: string; value: string }[]
    headers?: Record<string, string>
  } = {}
): NextRequest => {
  const url = new URL(pathname, 'http://localhost')
  const req = {
    url: pathname,
    nextUrl: {
      ...url,
      clone: () => new URL(pathname, 'http://localhost'),
      pathname,
      href: `http://localhost${pathname}`,
      search: url.search,
      searchParams: url.searchParams
    },
    cookies: {
      get: (name: string) =>
        options.cookies?.find((cookie) => cookie.name === name),
      getAll: () => options.cookies ?? []
    },
    headers: {
      get: (name: string) => options.headers?.[name] ?? null
    }
  } as unknown as NextRequest
  return req
}

describe('middleware', () => {
  describe('path checks', () => {
    it('should return undefined for internal next paths', () => {
      const req = createMockRequest('/_next/something')
      const result = middleware(req)
      expect(result).toBeUndefined()
    })

    it('should return undefined for API paths', () => {
      const req = createMockRequest('/api/endpoint')
      const result = middleware(req)
      expect(result).toBeUndefined()
    })

    it('should return undefined for non-watch routes', () => {
      const req = createMockRequest('/other/route')
      const result = middleware(req)
      expect(result).toBeUndefined()
    })

    it('should return undefined for asset paths', () => {
      const req = createMockRequest('/watch/assets/image.jpg')
      const result = middleware(req)
      expect(result).toBeUndefined()
    })
  })

  describe('locale detection', () => {
    it('should use URL path locale if no cookie', () => {
      const req = createMockRequest('/watch/jesus.html/french.html')
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should use browser language if no cookie or path locale', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should use geolocation if no other locale indicators', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'FR' }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should fallback to default locale if no locale detected', () => {
      const req = createMockRequest('/watch/jesus.html')
      const result = middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('URL rewriting', () => {
    it('should not rewrite URL for default locale', () => {
      const req = createMockRequest('/watch/jesus.html', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---en' }]
      })
      const result = middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('browser language parsing', () => {
    it('should handle multiple language preferences with weights', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: {
          'accept-language': 'fr-FR;q=0.9,fr;q=0.8,en-US;q=0.7,en;q=0.6'
        }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle simple language codes', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr' }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle unsupported languages by using default', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'xx-XX' }
      })
      const result = middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('geolocation handling', () => {
    it('should handle Cloudflare country headers', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'FR' }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle Vercel country headers', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'x-vercel-ip-country': 'FR' }
      })
      const result = middleware(req) as NextResponse
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle unsupported country codes by using default', () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'XX' }
      })
      const result = middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })
})
