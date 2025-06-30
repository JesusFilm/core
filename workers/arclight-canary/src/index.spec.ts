import { fetchMock } from 'cloudflare:test'

import app from '.'

describe('arclight-canary worker', () => {
  let originalRandom: typeof Math.random

  beforeAll(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })

  beforeEach(() => {
    originalRandom = Math.random
  })

  afterEach(() => {
    Math.random = originalRandom
    fetchMock.assertNoPendingInterceptors()
  })

  it('should route to core endpoint when random value is above weight', async () => {
    // Mock Math.random to return 0.8 (80%)
    Math.random = () => 0.8

    fetchMock
      .get('http://core.test')
      .intercept({ path: '/test-path' })
      .reply(200, 'core endpoint content')

    const res = await app.request(
      'http://localhost/test-path',
      {},
      {
        ENDPOINT_CORE: 'http://core.test',
        ENDPOINT_ARCLIGHT: 'http://arclight.test',
        ENDPOINT_ARCLIGHT_WEIGHT: '50'
      }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('core endpoint content')
    expect(res.headers.get('x-routed-to')).toBe('core')
  })

  it('should route to arclight endpoint when random value is below weight', async () => {
    // Mock Math.random to return 0.2 (20%)
    Math.random = () => 0.2

    fetchMock
      .get('http://arclight.test')
      .intercept({ path: '/test-path' })
      .reply(200, 'arclight endpoint content')

    const res = await app.request(
      'http://localhost/test-path',
      {},
      {
        ENDPOINT_CORE: 'http://core.test',
        ENDPOINT_ARCLIGHT: 'http://arclight.test',
        ENDPOINT_ARCLIGHT_WEIGHT: '50'
      }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('arclight endpoint content')
    expect(res.headers.get('x-routed-to')).toBe('arclight')
  })

  describe('path-based routing', () => {
    it.each([
      '/_next/static/chunks/main.js',
      '/_next/data/build-id/page.json',
      '/_next/image'
    ])(
      'should always route %s to core endpoint regardless of weight',
      async (path) => {
        // Mock Math.random to return 0 (0%) to ensure it would otherwise go to arclight
        Math.random = () => 0

        fetchMock
          .get('http://core.test')
          .intercept({ path })
          .reply(200, 'core endpoint content')

        const res = await app.request(
          `http://localhost${path}`,
          {},
          {
            ENDPOINT_CORE: 'http://core.test',
            ENDPOINT_ARCLIGHT: 'http://arclight.test',
            ENDPOINT_ARCLIGHT_WEIGHT: '100' // Would always go to arclight if not for path
          }
        )

        expect(res.status).toBe(200)
        expect(await res.text()).toBe('core endpoint content')
        expect(res.headers.get('x-routed-to')).toBe('core')
      }
    )

    it('should always route harness image to arclight endpoint regardless of weight', async () => {
      const path = '/build/v1harness/images/primary.png'

      fetchMock
        .get('http://arclight.test')
        .intercept({ path })
        .reply(200, 'arclight endpoint content')

      const res = await app.request(
        `http://localhost${path}`,
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '0' // Would always go to core if not for path
        }
      )

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('arclight endpoint content')
      expect(res.headers.get('x-routed-to')).toBe('arclight')
    })

    it('should allow normal routing for non-core paths', async () => {
      fetchMock
        .get('http://arclight.test')
        .intercept({ path: '/api/graphql' })
        .reply(200, 'arclight endpoint content')

      const res = await app.request(
        'http://localhost/api/graphql',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '100' // Force arclight endpoint
        }
      )

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('arclight endpoint content')
      expect(res.headers.get('x-routed-to')).toBe('arclight')
    })
  })

  it('should preserve request method and headers', async () => {
    const headers = {
      'x-custom-header': 'test-value',
      'content-type': 'application/json',
      accept: 'application/json'
    }
    let interceptedHeaders: Record<string, string>

    fetchMock
      .get('http://core.test')
      .intercept({
        path: '/test-path',
        method: 'POST',
        headers: (h) => {
          interceptedHeaders = h
          return true
        }
      })
      .reply(200, 'success')

    const res = await app.request(
      'http://localhost/test-path',
      {
        method: 'POST',
        headers
      },
      {
        ENDPOINT_CORE: 'http://core.test',
        ENDPOINT_ARCLIGHT: 'http://arclight.test',
        ENDPOINT_ARCLIGHT_WEIGHT: '0' // Force core endpoint
      }
    )

    expect(res.status).toBe(200)
    expect(res.headers.get('x-routed-to')).toBe('core')
    Object.entries(headers).forEach(([key, value]) => {
      expect(interceptedHeaders[key]).toBe(value)
    })
  })

  describe('error handling', () => {
    it('should handle request timeouts with 503', async () => {
      fetchMock
        .get('http://core.test')
        .intercept({ path: '/test-path' })
        .reply(200, 'success')
        .delay(150) // Delay longer than timeout

      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '0',
          TIMEOUT: '100'
        }
      )

      expect(res.status).toBe(503)
      expect(await res.text()).toBe('Service Unavailable')
    })

    it('should handle network errors with 503', async () => {
      fetchMock
        .get('http://core.test')
        .intercept({ path: '/test-path' })
        .replyWithError(new TypeError('Failed to fetch'))

      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '0' // Force core endpoint
        }
      )

      expect(res.status).toBe(503)
      expect(await res.text()).toBe('Service Unavailable')
    })

    it('should handle unexpected errors with 500', async () => {
      fetchMock
        .get('http://core.test')
        .intercept({ path: '/test-path' })
        .replyWithError(new Error('Unexpected error'))

      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '0' // Force core endpoint
        }
      )

      expect(res.status).toBe(500)
      expect(await res.text()).toBe('Internal Server Error')
    })

    it('should handle missing endpoint configuration with 500', async () => {
      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_ARCLIGHT_WEIGHT: '50'
        }
      )

      expect(res.status).toBe(500)
      expect(await res.text()).toBe('Internal Server Error')
    })
  })

  describe('weight validation', () => {
    it('should reject negative weights with 400', async () => {
      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '-10'
        }
      )

      expect(res.status).toBe(400)
      expect(await res.text()).toBe(
        'Invalid Configuration: Weight must be an integer between 0 and 100'
      )
    })

    it('should reject weights above 100 with 400', async () => {
      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '150'
        }
      )

      expect(res.status).toBe(400)
      expect(await res.text()).toBe(
        'Invalid Configuration: Weight must be an integer between 0 and 100'
      )
    })

    it('should reject non-integer weights with 400', async () => {
      const res = await app.request(
        'http://localhost/test-path',
        {},
        {
          ENDPOINT_CORE: 'http://core.test',
          ENDPOINT_ARCLIGHT: 'http://arclight.test',
          ENDPOINT_ARCLIGHT_WEIGHT: '50.5'
        }
      )

      expect(res.status).toBe(400)
      expect(await res.text()).toBe(
        'Invalid Configuration: Weight must be an integer between 0 and 100'
      )
    })
  })

  describe('apiKey force routing (comma-separated lists)', () => {
    const FORCE_API_KEYS_TO_ARCLIGHT =
      'arclight-key-123, arclight-key-abc,  arclight-key-xyz '
    const FORCE_API_KEYS_TO_CORE = 'core-key-456, core-key-def, core-key-uvw '
    const baseEnv = {
      ENDPOINT_CORE: 'http://core.test',
      ENDPOINT_ARCLIGHT: 'http://arclight.test',
      ENDPOINT_ARCLIGHT_WEIGHT: '0', // Force core unless overridden
      FORCE_API_KEYS_TO_ARCLIGHT,
      FORCE_API_KEYS_TO_CORE
    }

    it('should route to arclight if apiKey matches any in FORCE_API_KEYS_TO_ARCLIGHT (first, trimmed, or last)', async () => {
      for (const key of [
        'arclight-key-123',
        'arclight-key-abc',
        'arclight-key-xyz'
      ]) {
        fetchMock
          .get('http://arclight.test')
          .intercept({ path: `/any-path?apiKey=${key}` })
          .reply(200, 'arclight endpoint content')

        const res = await app.request(
          `http://localhost/any-path?apiKey=${key}`,
          {},
          baseEnv
        )

        expect(res.status).toBe(200)
        expect(await res.text()).toBe('arclight endpoint content')
        expect(res.headers.get('x-routed-to')).toBe('arclight')
      }
    })

    it('should route to core if apiKey matches any in FORCE_API_KEYS_TO_CORE (first, trimmed, or last)', async () => {
      for (const key of ['core-key-456', 'core-key-def', 'core-key-uvw']) {
        fetchMock
          .get('http://core.test')
          .intercept({ path: `/any-path?apiKey=${key}` })
          .reply(200, 'core endpoint content')

        const res = await app.request(
          `http://localhost/any-path?apiKey=${key}`,
          {},
          baseEnv
        )

        expect(res.status).toBe(200)
        expect(await res.text()).toBe('core endpoint content')
        expect(res.headers.get('x-routed-to')).toBe('core')
      }
    })

    it('should preserve apiKey in forwarded request for arclight', async () => {
      let interceptedUrl: string = ''
      fetchMock
        .get('http://arclight.test')
        .intercept({
          path: (path) => {
            interceptedUrl = path
            return true
          }
        })
        .reply(200, 'arclight endpoint content')

      await app.request(
        `http://localhost/forwarded?apiKey=arclight-key-abc&foo=bar`,
        {},
        baseEnv
      )

      expect(interceptedUrl).toContain('apiKey=arclight-key-abc')
      expect(interceptedUrl).toContain('foo=bar')
    })

    it('should preserve apiKey in forwarded request for core', async () => {
      let interceptedUrl: string = ''
      fetchMock
        .get('http://core.test')
        .intercept({
          path: (path) => {
            interceptedUrl = path
            return true
          }
        })
        .reply(200, 'core endpoint content')

      await app.request(
        `http://localhost/forwarded?apiKey=core-key-def&foo=bar`,
        {},
        baseEnv
      )

      expect(interceptedUrl).toContain('apiKey=core-key-def')
      expect(interceptedUrl).toContain('foo=bar')
    })

    it('should use normal routing if apiKey does not match any force key', async () => {
      fetchMock
        .get('http://core.test')
        .intercept({ path: '/normal?apiKey=wrong-key' })
        .reply(200, 'core endpoint content')

      const res = await app.request(
        'http://localhost/normal?apiKey=wrong-key',
        {},
        baseEnv
      )

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('core endpoint content')
      expect(res.headers.get('x-routed-to')).toBe('core')
    })

    it('should handle whitespace and order in FORCE_API_KEYS_TO_ARCLIGHT and FORCE_API_KEYS_TO_CORE', async () => {
      // Out of order and with extra whitespace
      fetchMock
        .get('http://arclight.test')
        .intercept({ path: '/any-path?apiKey=arclight-key-xyz' })
        .reply(200, 'arclight endpoint content')
      let res = await app.request(
        'http://localhost/any-path?apiKey=arclight-key-xyz',
        {},
        baseEnv
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('x-routed-to')).toBe('arclight')

      fetchMock
        .get('http://core.test')
        .intercept({ path: '/any-path?apiKey=core-key-uvw' })
        .reply(200, 'core endpoint content')
      res = await app.request(
        'http://localhost/any-path?apiKey=core-key-uvw',
        {},
        baseEnv
      )
      expect(res.status).toBe(200)
      expect(res.headers.get('x-routed-to')).toBe('core')
    })
  })
})
