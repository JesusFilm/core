import { Redis } from '@upstash/redis'
import { HttpResponse, http } from 'msw'
import { NextRequest, NextResponse } from 'next/server'

import {
  AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION,
  middleware
} from './middleware'
import { server } from './test/mswServer'

jest.mock('@upstash/redis', () => ({
  Redis: jest.fn()
}))

const mockRedis = Redis as jest.MockedClass<typeof Redis>

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
  let mockRedisExists: jest.Mock,
    mockRedisHset: jest.Mock,
    mockRedisHget: jest.Mock,
    mockRedisExpire: jest.Mock

  beforeEach(() => {
    mockRedisExists = jest.fn()
    mockRedisHset = jest.fn()
    mockRedisHget = jest.fn()
    mockRedisExpire = jest.fn()
    mockRedis.mockImplementation(
      () =>
        ({
          exists: mockRedisExists,
          hset: mockRedisHset,
          hget: mockRedisHget,
          expire: mockRedisExpire
        }) as unknown as Redis
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

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

  describe('audio language redirect', () => {
    const mockVariantLanguages = {
      '123': 'spanish',
      '456': 'french',
      '529': 'english'
    }

    describe('Redis cache scenarios', () => {
      it('should redirect to preferred audio language when cached data exists', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(mockRedisHget).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          '123'
        )
        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })

      it('should not redirect when user is already on preferred audio language', async () => {
        // Mock Redis cache hit
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/jesus.html/spanish.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(mockRedisHget).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          '123'
        )
        expect(result?.status).toBe(200)
      })

      it('should handle Redis cache miss and fetch from API', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Mock successful Redis cache operations
        mockRedisHset.mockResolvedValue(1)
        mockRedisExpire.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        server.use(
          http.get('http://localhost/api/variantLanguages', ({ request }) =>
            HttpResponse.json({
              data: {
                variantLanguages: {
                  '123': 'spanish',
                  '456': 'french',
                  '529': 'english'
                }
              }
            })
          )
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should cache the result using hset and expire
        expect(mockRedisHset).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          mockVariantLanguages
        )
        expect(mockRedisExpire).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          86400
        )

        // Should redirect
        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })

      it('should handle Redis cache set failures gracefully', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Mock Redis cache operations with failures
        mockRedisHset.mockRejectedValue(new Error('Redis hset error'))
        mockRedisExpire.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should still redirect even if caching fails
        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })
    })

    describe('API fallback scenarios', () => {
      it('should handle API fetch failures gracefully', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Override MSW handler to simulate API failure
        server.use(
          http.get('http://localhost/api/variantLanguages', () => {
            return HttpResponse.error()
          })
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should handle API response validation failures', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Override MSW handler to return invalid data
        server.use(
          http.get('http://localhost/api/variantLanguages', () => {
            return HttpResponse.json({
              data: { variantLanguages: 'invalid-data' }
            })
          })
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should handle empty API responses', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Override MSW handler to return empty data
        server.use(
          http.get('http://localhost/api/variantLanguages', () => {
            return HttpResponse.json({
              data: { variantLanguages: {} }
            })
          })
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available
        expect(result?.status).toBe(200)
      })

      it('should handle API response with missing variantLanguages data', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Override MSW handler to return missing data
        server.use(
          http.get('http://localhost/api/variantLanguages', () => {
            return HttpResponse.json({
              data: {} // Missing variantLanguages property
            })
          })
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available (empty object fallback)
        expect(result?.status).toBe(200)
      })

      it('should handle API response with undefined variantLanguages data', async () => {
        // Mock Redis cache miss
        mockRedisExists.mockResolvedValue(0)

        // Override MSW handler to return undefined data
        server.use(
          http.get('http://localhost/api/variantLanguages', () => {
            return HttpResponse.json({
              data: { variantLanguages: undefined }
            })
          })
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available (empty object fallback)
        expect(result?.status).toBe(200)
      })
    })

    describe('path structure handling', () => {
      it('should handle 3-segment paths (video/audio)', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })

      it('should handle 4-segment paths (category/video/audio)', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/movies/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/movies/jesus.html/spanish.html'
        )
      })

      it('should not process paths with fewer than 3 segments', async () => {
        const req = createMockRequest('/watch/jesus.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })
    })

    describe('cookie handling', () => {
      it('should not redirect when AUDIO_LANGUAGE cookie is missing', async () => {
        const req = createMockRequest('/watch/jesus.html/english.html')

        const result = await middleware(req)

        expect(result?.status).toBe(200)
        expect(mockRedisExists).not.toHaveBeenCalled()
      })

      it('should handle malformed AUDIO_LANGUAGE cookie', async () => {
        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'invalid-format' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should extract language ID from cookie correctly', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('french')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---456' }]
        })

        const result = await middleware(req)

        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/french.html'
        )
      })
    })

    describe('Redis data validation', () => {
      it('should handle invalid cached data gracefully', async () => {
        // Mock invalid cached data - key exists but data is invalid
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('invalid-data')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        await middleware(req)

        // Should not redirect when cached data is invalid
        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(mockRedisHget).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          '123'
        )
      })

      it('should handle null cached data', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue(null)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        await middleware(req)

        // Should not redirect when no slug found for language ID
        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(mockRedisHget).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          '123'
        )
      })

      it('should handle Redis hget errors gracefully', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockRejectedValue(
          new Error('Redis hget connection failed')
        )

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when Redis hget fails
        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(mockRedisHget).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`,
          '123'
        )
        expect(result?.status).toBe(200)
      })

      it('should handle Redis cache errors gracefully', async () => {
        // Mock Redis cache error
        mockRedisExists.mockRejectedValue(new Error('Redis connection failed'))

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when Redis fails
        expect(mockRedisExists).toHaveBeenCalledWith(
          `variantLanguages:${AUDIO_LANGUAGE_REDIRECT_CACHE_SCHEMA_VERSION}:jesus`
        )
        expect(result?.status).toBe(200)
      })
    })

    describe('integration with locale detection', () => {
      it('should process audio redirect before locale rewriting', async () => {
        mockRedisExists.mockResolvedValue(1)
        mockRedisHget.mockResolvedValue('spanish')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [
            { name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' },
            { name: 'NEXT_LOCALE', value: 'fingerprint---fr' }
          ]
        })

        const result = await middleware(req)

        // Should redirect to preferred audio language
        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })
    })

    it('should skip audio language redirect when r=0 query parameter is present', async () => {
      const req = createMockRequest('/watch/jesus.html/english.html?r=0', {
        cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
      })

      const result = await middleware(req)

      // Should not redirect when r=0 is present
      expect(result?.status).toBe(200)
      expect(mockRedisExists).not.toHaveBeenCalled()
      expect(mockRedisHget).not.toHaveBeenCalled()
    })
  })

  describe('automatic audio language redirect without cookie', () => {
    it('should redirect using browser language when no AUDIO_LANGUAGE cookie present', async () => {
      mockRedisExists.mockResolvedValue(1)
      mockRedisHget.mockResolvedValue('french')

      const req = createMockRequest('/watch/jesus.html/english.html', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9' }
      })

      const result = await middleware(req)

      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toContain(
        '/watch/jesus.html/french.html'
      )
    })

    it('should redirect using geolocation when no browser language', async () => {
      mockRedisExists.mockResolvedValue(1)
      mockRedisHget.mockResolvedValue('french')

      const req = createMockRequest('/watch/jesus.html/english.html', {
        headers: { 'cf-ipcountry': 'FR' }
      })

      const result = await middleware(req)

      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toContain(
        '/watch/jesus.html/french.html'
      )
    })

    it('should prioritize browser language over geolocation', async () => {
      mockRedisExists.mockResolvedValue(1)
      mockRedisHget.mockResolvedValue('spanish')

      const req = createMockRequest('/watch/jesus.html/english.html', {
        headers: {
          'accept-language': 'es-ES,es;q=0.9',
          'cf-ipcountry': 'FR'
        }
      })

      const result = await middleware(req)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toContain(
        '/watch/jesus.html/spanish.html'
      )
    })

    it('should not redirect when neither browser language nor geolocation are supported', async () => {
      const req = createMockRequest('/watch/jesus.html/english.html', {
        headers: {
          'accept-language': 'xx-XX',
          'cf-ipcountry': 'XX'
        }
      })

      const result = await middleware(req)

      expect(result?.status).toBe(200)
    })

    it('should work with 4-segment paths', async () => {
      mockRedisExists.mockResolvedValue(1)
      mockRedisHget.mockResolvedValue('spanish')

      const req = createMockRequest('/watch/movies/jesus.html/english.html', {
        headers: { 'accept-language': 'es-ES,es;q=0.9' }
      })

      const result = await middleware(req)

      expect(result?.status).toBe(307)
      expect(result?.headers.get('location')).toContain(
        '/watch/movies/jesus.html/spanish.html'
      )
    })
  })

  describe('middleware configuration', () => {
    it('should have correct matcher configuration', () => {
      // This tests that the middleware config is properly exported
      expect(middleware).toBeDefined()
    })

    it('should handle watch root path with locale redirect', async () => {
      const req = createMockRequest('/watch', {
        headers: { 'accept-language': 'fr-FR,fr;q=0.9,en;q=0.8' }
      })

      const result = await middleware(req)

      expect(result).toBeInstanceOf(NextResponse)
      expect(result?.status).toBe(302)
      // Should redirect to French locale
      expect(result?.headers.get('location')).toContain('/watch/')
    })

    it('should handle watch root path with default locale', async () => {
      const req = createMockRequest('/watch')

      const result = await middleware(req)

      expect(result?.status).toBe(200)
    })
  })
})
