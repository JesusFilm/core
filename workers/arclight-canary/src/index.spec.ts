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

    it('should allow normal routing for non-core paths', async () => {
      Math.random = () => 0 // Would go to arclight

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
          ENDPOINT_ARCLIGHT_WEIGHT: '100'
        }
      )

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('arclight endpoint content')
      expect(res.headers.get('x-routed-to')).toBe('arclight')
    })
  })

  it('should preserve request method and headers', async () => {
    Math.random = () => 1 // Force core endpoint
    const headers = { 'x-custom-header': 'test-value' }

    fetchMock
      .get('http://core.test')
      .intercept({
        path: '/test-path',
        method: 'POST',
        headers
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
  })

  describe('error handling', () => {
    it('should handle network errors with 503', async () => {
      Math.random = () => 1 // Force core endpoint

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
      Math.random = () => 1 // Force core endpoint

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
})
