import { NextRequest, NextResponse } from 'next/server'

import { proxy } from './proxy'

const createMockRequest = (
  path: string,
  options: {
    cookies?: { name: string; value: string }[]
    headers?: Record<string, string>
  } = {}
): NextRequest => {
  const url = new URL(path, 'http://localhost')
  const req = {
    url: url.toString(),
    nextUrl: {
      ...url,
      clone: () => new URL(path, 'http://localhost'),
      pathname: url.pathname,
      href: url.toString(),
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

describe('proxy', () => {
  describe('locale detection', () => {
    it('should use URL path locale if no cookie', async () => {
      const req = createMockRequest('/watch/jesus.html/french.html')
      const result = await proxy(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain(
        '/watch/fr/jesus.html/french.html'
      )
    })

    it('should use browser language if no cookie or path locale', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = await proxy(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain(
        '/watch/fr/jesus.html'
      )
    })

    it('should fallback to default locale if no locale detected', async () => {
      const req = createMockRequest('/watch/jesus.html')
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('URL rewriting', () => {
    it('should not rewrite URL for default locale', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---en' }]
      })
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })

    it('should not rewrite new locale-prefixed home routes', async () => {
      const req = createMockRequest('/watch/fr', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---fr' }]
      })
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })

    it('should not rewrite new locale-prefixed nested routes', async () => {
      const req = createMockRequest('/watch/fr/videos', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = await proxy(req)
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
      const result = await proxy(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain(
        '/watch/fr/jesus.html'
      )
    })

    it('should handle simple language codes', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'fr' }
      })
      const result = await proxy(req)
      expect(result?.headers.get('x-middleware-rewrite')).toContain(
        '/watch/fr/jesus.html'
      )
    })

    it('should handle unsupported languages by using default', async () => {
      const req = createMockRequest('/watch/jesus.html', {
        headers: { 'accept-language': 'xx-XX' }
      })
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('static assets', () => {
    it('should not rewrite requests for static assets (e.g. images)', async () => {
      const req = createMockRequest('/watch/images/jesus-film-logo-full.svg', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })

    it('should not rewrite Next image optimizer requests', async () => {
      const req = createMockRequest(
        '/watch/_next/image?url=https%3A%2F%2Fwww.jesusfilm.org%2Fimage.jpg&w=3840&q=75',
        {
          headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
        }
      )
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })

    it('should not rewrite base-path API requests', async () => {
      const req = createMockRequest('/watch/api/languages', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })
      const result = await proxy(req)
      expect(result).toEqual(NextResponse.next())
    })
  })

  describe('proxy configuration', () => {
    it('should handle watch root path with cookie', async () => {
      const req = createMockRequest('/watch', {
        cookies: [{ name: 'NEXT_LOCALE', value: 'fingerprint---fr' }]
      })
      const result = await proxy(req)
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      // Should redirect to the new French locale route
      expect(result?.headers.get('location')).toContain('/watch/fr')
    })

    it('should handle watch root path with locale redirect', async () => {
      const req = createMockRequest('/watch', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })

      const result = await proxy(req)
      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      // Should redirect to the new French locale route
      expect(result?.headers.get('location')).toContain('/watch/fr')
    })

    it('should handle watch root path with default locale', async () => {
      const req = createMockRequest('/watch')

      const result = await proxy(req)

      expect(result?.status).toBe(200)
    })
  })
})
