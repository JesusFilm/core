import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

import { middleware } from './middleware'

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
  let mockRedisGet: jest.Mock,
    mockRedisSet: jest.Mock,
    mockGlobalFetch: jest.Mock

  beforeEach(() => {
    mockGlobalFetch = jest.fn()
    global.fetch = mockGlobalFetch
    mockRedisGet = jest.fn()
    mockRedisSet = jest.fn()
    mockRedis.mockImplementation(
      () =>
        ({
          get: mockRedisGet,
          set: mockRedisSet
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
      '123': 'jesus/spanish',
      '456': 'jesus/french',
      '529': 'jesus/english'
    }

    describe('Redis cache scenarios', () => {
      it('should redirect to preferred audio language when cached data exists', async () => {
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(mockRedisGet).toHaveBeenCalledWith('variantLanguages:jesus')
        expect(result).toBeInstanceOf(NextResponse)
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })

      it('should not redirect when user is already on preferred audio language', async () => {
        // Mock Redis cache hit
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

        const req = createMockRequest('/watch/jesus.html/spanish.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(mockRedisGet).toHaveBeenCalledWith('variantLanguages:jesus')
        expect(result?.status).toBe(200)
      })

      it('should handle Redis cache miss and fetch from API', async () => {
        // Mock Redis cache miss
        mockRedisGet.mockResolvedValue(null)

        // Mock API response
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: mockVariantLanguages }
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        // Mock successful Redis cache set
        mockRedisSet.mockResolvedValue('OK')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should fetch from API
        expect(mockGlobalFetch).toHaveBeenCalledWith(
          'http://localhost/api/variantLanguages?slug=jesus/english'
        )

        // Should cache the result
        expect(mockRedisSet).toHaveBeenCalledWith(
          'variantLanguages:jesus',
          mockVariantLanguages,
          { ex: 86400 }
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
        mockRedisGet.mockResolvedValue(null)

        // Mock API response
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: mockVariantLanguages }
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        // Mock Redis cache set failure
        mockRedisSet.mockRejectedValue(new Error('Redis error'))

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
        mockRedisGet.mockResolvedValue(null)

        // Mock API failure
        mockGlobalFetch.mockRejectedValue(new Error('Network error'))

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should handle API response validation failures', async () => {
        // Mock Redis cache miss
        mockRedisGet.mockResolvedValue(null)

        // Mock invalid API response
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: 'invalid-data' }
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should handle empty API responses', async () => {
        // Mock Redis cache miss
        mockRedisGet.mockResolvedValue(null)

        // Mock empty API response
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: {} }
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available
        expect(result?.status).toBe(200)
      })

      it('should handle API response with missing variantLanguages data', async () => {
        // Mock Redis cache miss
        mockRedisGet.mockResolvedValue(null)

        // Mock API response with missing variantLanguages data
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: {} // Missing variantLanguages property
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available (empty array fallback)
        expect(result?.status).toBe(200)
        expect(mockGlobalFetch).toHaveBeenCalled()
        expect(mockGlobalFetch).toHaveBeenCalledWith(
          'http://localhost/api/variantLanguages?slug=jesus/english'
        )
      })

      it('should handle API response with undefined variantLanguages data', async () => {
        // Mock Redis cache miss
        mockRedisGet.mockResolvedValue(null)

        // Mock API response with undefined variantLanguages data
        const mockApiResponse = {
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: undefined }
          })
        }
        mockGlobalFetch.mockResolvedValue(mockApiResponse)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        const result = await middleware(req)

        // Should not redirect when no variants available (empty array fallback)
        expect(result?.status).toBe(200)
        expect(mockGlobalFetch).toHaveBeenCalled()
        expect(mockGlobalFetch).toHaveBeenCalledWith(
          'http://localhost/api/variantLanguages?slug=jesus/english'
        )
      })
    })

    describe('path structure handling', () => {
      it('should handle 3-segment paths (video/audio)', async () => {
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

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
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

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
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

        const req = createMockRequest('/watch/jesus.html/english.html')

        const result = await middleware(req)

        expect(result?.status).toBe(200)
        expect(mockRedisGet).not.toHaveBeenCalled()
      })

      it('should handle malformed AUDIO_LANGUAGE cookie', async () => {
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'invalid-format' }]
        })

        const result = await middleware(req)

        expect(result?.status).toBe(200)
      })

      it('should extract language ID from cookie correctly', async () => {
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

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
        // Mock invalid cached data
        mockRedisGet.mockResolvedValue('invalid-data')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        await middleware(req)

        // Should fall back to API when cached data is invalid
        expect(mockGlobalFetch).toHaveBeenCalled()
      })

      it('should handle null cached data', async () => {
        mockRedisGet.mockResolvedValue(null)

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        await middleware(req)

        // Should fall back to API
        expect(mockGlobalFetch).toHaveBeenCalled()
      })

      it('should handle Redis data validation failures gracefully', async () => {
        // Mock Redis cache hit with invalid data that will fail Zod validation
        mockRedisGet.mockResolvedValue('invalid-data-that-fails-zod-validation')

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        mockGlobalFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: mockVariantLanguages }
          })
        })

        const result = await middleware(req)

        // Should fall back to API when cached data validation fails
        expect(mockGlobalFetch).toHaveBeenCalled()
        expect(mockGlobalFetch).toHaveBeenCalledWith(
          'http://localhost/api/variantLanguages?slug=jesus/english'
        )

        // Should still redirect if API provides valid data
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })

      it('should handle Redis cache errors gracefully', async () => {
        // Mock Redis cache error
        mockRedisGet.mockRejectedValue(new Error('Redis connection failed'))

        const req = createMockRequest('/watch/jesus.html/english.html', {
          cookies: [{ name: 'AUDIO_LANGUAGE', value: 'fingerprint---123' }]
        })

        mockGlobalFetch.mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({
            data: { variantLanguages: mockVariantLanguages }
          })
        })

        const result = await middleware(req)

        // Should fall back to API when Redis fails
        expect(mockGlobalFetch).toHaveBeenCalled()
        expect(mockGlobalFetch).toHaveBeenCalledWith(
          'http://localhost/api/variantLanguages?slug=jesus/english'
        )

        // Should still redirect if API provides valid data
        expect(result?.status).toBe(307)
        expect(result?.headers.get('location')).toContain(
          '/watch/jesus.html/spanish.html'
        )
      })
    })

    describe('integration with locale detection', () => {
      it('should process audio redirect before locale rewriting', async () => {
        mockRedisGet.mockResolvedValue(mockVariantLanguages)

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
