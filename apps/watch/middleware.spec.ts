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
    url: `http://localhost${pathname}`,
    nextUrl: {
      ...url,
      clone: () => new URL(pathname, 'http://localhost'),
      pathname,
      href: `http://localhost${pathname}`,
      search: url.search,
      searchParams: url.searchParams,
      origin: 'http://localhost'
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
  describe('locale detection', () => {
    it('should use URL path locale if no cookie', async () => {
      const req = createMockRequest('/watch/jesus.html/french.html')
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should use browser language if no cookie or path locale', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should use geolocation if no other locale indicators', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'FR' }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should fallback to default locale if no locale detected', async () => {
      const req = createMockRequest('/watch/jesus.html')
      const result = await middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('URL rewriting', () => {
    it('should not rewrite URL for default locale', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---en' }]
      })
      const result = await middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('browser language parsing', () => {
    it('should handle multiple language preferences with weights', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: {
          'accept-language': 'fr-FR;q=0.9,fr;q=0.8,en-US;q=0.7,en;q=0.6'
        }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle simple language codes', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr' }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle unsupported languages by using default', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'xx-XX' }
      })
      const result = await middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('geolocation handling', () => {
    it('should handle Cloudflare country headers', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'FR' }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle Vercel country headers', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'x-vercel-ip-country': 'FR' }
      })
      const result = await middleware(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain('/fr/')
    })

    it('should handle unsupported country codes by using default', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'cf-ipcountry': 'XX' }
      })
      const result = await middleware(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('middleware configuration', () => {
    it('should handle watch root path with cookie', async () => {
      const req = createMockRequest('/watch', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---fr' }]
      })
      const result = await middleware(req)
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      // Should redirect to French locale
      expect(result?.headers.get('location')).toContain('/watch/french.html')
    })

    it('should handle watch root path with locale redirect', async () => {
      const req = createMockRequest('/watch', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })

      const result = await middleware(req)
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      // Should redirect to French locale
      expect(result?.headers.get('location')).toContain('/watch/french.html')
    })

    it('should handle watch root path with geolocation redirect', async () => {
      const req = createMockRequest('/watch', {
        headers: { 'cf-ipcountry': 'FR' }
      })
      const result = await middleware(req)
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      expect(result?.headers.get('location')).toContain('/watch/french.html')
    })

    it('should handle watch root path with default locale', async () => {
      const req = createMockRequest('/watch')

      const result = await middleware(req)

      expect(result?.status).toBe(200)
    })
  })
})
