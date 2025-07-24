import { fetchMock } from 'cloudflare:test'

import app from '.'

describe('test the worker', () => {
  beforeAll(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  it('should return 200 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(200, 'body content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { WATCH_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body content')
  })

  it('should route /watch/modern to WATCH_MODERN_PROXY_DEST', async () => {
    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/modern' })
      .reply(200, 'modern content')

    const res = await app.request(
      'http://localhost/watch/modern',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern content')
  })

  it('should route /watch/modern/subpath to WATCH_MODERN_PROXY_DEST', async () => {
    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/modern/video/123' })
      .reply(200, 'modern subpath content')

    const res = await app.request(
      'http://localhost/watch/modern/video/123',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern subpath content')
  })

  it('should NOT route /watch/modern-test to WATCH_MODERN_PROXY_DEST', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/watch/modern-test' })
      .reply(200, 'legacy content')

    const res = await app.request(
      'http://localhost/watch/modern-test',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('legacy content')
  })

  it('should route /api/modern to WATCH_PROXY_DEST (not modern)', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/api/modern' })
      .reply(200, 'api modern content')

    const res = await app.request(
      'http://localhost/api/modern',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('api modern content')
  })

  it('should route /watch/legacy to WATCH_PROXY_DEST', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/watch/legacy' })
      .reply(200, 'legacy content')

    const res = await app.request(
      'http://localhost/watch/legacy',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('legacy content')
  })

  it('should handle invalid regex patterns gracefully', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path' })
      .reply(200, 'fallback content')

    const res = await app.request(
      'http://localhost/test-path',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          'invalid[regex',
          '^/watch/modern$',
          '^/watch/modern/'
        ]
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('fallback content')
  })

  it('should handle missing WATCH_MODERN_PROXY_DEST gracefully', async () => {
    fetchMock
      .get('http://localhost')
      .intercept({ path: '/watch/modern' })
      .reply(200, 'original host content')

    const res = await app.request(
      'http://localhost/watch/modern',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_PATHS: ['^/watch/modern$', '^/watch/modern/']
        // Missing WATCH_MODERN_PROXY_DEST
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('original host content')
  })

  it('should handle 404 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(404, 'body content')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .reply(404, 'not found content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { WATCH_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('not found content')
  })

  it('should handle 500 response', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(500, 'server error')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .reply(404, 'not found content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { WATCH_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('not found content')
  })

  it('should handle network error in main fetch', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .replyWithError(new Error('Network error'))

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { WATCH_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(503)
    expect(await res.text()).toBe('Service Unavailable')
  })

  it('should handle network error in not-found fetch', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path%aa' })
      .reply(404, 'not found')

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .replyWithError(new Error('Network error'))

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      { WATCH_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('Not Found')
  })

  it('should handle missing WATCH_PROXY_DEST binding', async () => {
    fetchMock
      .get('http://localhost')
      .intercept({ path: '/test-path%aa' })
      .reply(200, 'original host content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      {} // No WATCH_PROXY_DEST binding
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('original host content')
  })
})
