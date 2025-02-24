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
    fetchMock.assertNoPendingInterceptors()
    Math.random = originalRandom
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

  it('should preserve request method and headers', async () => {
    Math.random = () => 1 // Force core endpoint

    fetchMock
      .get('http://core.test')
      .intercept({ path: '/test-path', method: 'POST' })
      .reply(200, 'success')

    const res = await app.request(
      'http://localhost/test-path',
      {
        method: 'POST',
        headers: { 'x-custom-header': 'test-value' }
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

  it('should handle network errors gracefully', async () => {
    Math.random = () => 1 // Force core endpoint

    fetchMock
      .get('http://core.test')
      .intercept({ path: '/test-path' })
      .replyWithError(new Error('Network error'))

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

  it('should handle missing endpoint configuration', async () => {
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
