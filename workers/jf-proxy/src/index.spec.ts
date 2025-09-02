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

  it('should pass cookies to the underlying fetch', async () => {
    let capturedHeaders: any = null

    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path' })
      .reply((req) => {
        capturedHeaders = req.headers
        return { statusCode: 200, data: 'body content' }
      })

    const res = await app.request(
      'http://localhost/test-path',
      {
        headers: {
          cookie: 'session=abc123; user=john',
          'user-agent': 'test-agent',
          accept: 'text/html'
        }
      },
      { WATCH_PROXY_DEST: 'test.example.com' }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body content')

    // Verify that cookies and other headers were passed
    expect(capturedHeaders).not.toBeNull()
    if (capturedHeaders && typeof capturedHeaders.get === 'function') {
      expect(capturedHeaders.get('cookie')).toBe('session=abc123; user=john')
      expect(capturedHeaders.get('user-agent')).toBe('test-agent')
      expect(capturedHeaders.get('accept')).toBe('text/html')
    } else {
      expect(capturedHeaders['cookie']).toBe('session=abc123; user=john')
      expect(capturedHeaders['user-agent']).toBe('test-agent')
      expect(capturedHeaders['accept']).toBe('text/html')
    }
  })

  it('should pass cookies to modern proxy destination', async () => {
    let capturedHeaders: any = null

    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/modern' })
      .reply((req) => {
        capturedHeaders = req.headers
        return { statusCode: 200, data: 'modern content' }
      })

    const res = await app.request(
      'http://localhost/watch/modern',
      {
        headers: {
          cookie: 'session=abc123; user=john',
          authorization: 'Bearer token123'
        }
      },
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
      }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern content')

    // Verify that cookies and auth headers were passed to modern proxy
    expect(capturedHeaders).not.toBeNull()
    if (capturedHeaders && typeof capturedHeaders.get === 'function') {
      expect(capturedHeaders.get('cookie')).toBe('session=abc123; user=john')
      expect(capturedHeaders.get('authorization')).toBe('Bearer token123')
    } else {
      expect(capturedHeaders['cookie']).toBe('session=abc123; user=john')
      expect(capturedHeaders['authorization']).toBe('Bearer token123')
    }
  })

  it('should pass cookies to fallback not-found page', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path' })
      .reply(404, 'not found')

    let capturedHeaders: any = null

    fetchMock
      .get('http://localhost')
      .intercept({ path: '/not-found.html' })
      .reply((req) => {
        capturedHeaders = req.headers
        return { statusCode: 404, data: 'not found content' }
      })

    const res = await app.request(
      'http://localhost/test-path',
      {
        headers: {
          cookie: 'session=abc123; user=john',
          'user-agent': 'test-agent'
        }
      },
      { WATCH_PROXY_DEST: 'test.example.com' }
    )

    expect(res.status).toBe(404)
    expect(await res.text()).toBe('not found content')

    // Verify that cookies were passed to fallback fetch
    expect(capturedHeaders).not.toBeNull()
    if (capturedHeaders && typeof capturedHeaders.get === 'function') {
      expect(capturedHeaders.get('cookie')).toBe('session=abc123; user=john')
      expect(capturedHeaders.get('user-agent')).toBe('test-agent')
    } else {
      expect(capturedHeaders['cookie']).toBe('session=abc123; user=john')
      expect(capturedHeaders['user-agent']).toBe('test-agent')
    }
  })

  it('should handle requests without cookies gracefully', async () => {
    let capturedHeaders: any = null

    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/test-path' })
      .reply((req) => {
        capturedHeaders = req.headers
        return { statusCode: 200, data: 'body content' }
      })

    const res = await app.request(
      'http://localhost/test-path',
      {
        headers: {
          'user-agent': 'test-agent'
        }
      },
      { WATCH_PROXY_DEST: 'test.example.com' }
    )

    expect(res.status).toBe(200)
    expect(await res.text()).toBe('body content')

    // Verify that other headers are passed but no cookie header is set
    expect(capturedHeaders).not.toBeNull()
    if (capturedHeaders && typeof capturedHeaders.get === 'function') {
      expect(capturedHeaders.get('user-agent')).toBe('test-agent')
      expect(capturedHeaders.get('cookie')).toBeNull()
    } else {
      expect(capturedHeaders['user-agent']).toBe('test-agent')
      expect(capturedHeaders['cookie']).toBeUndefined()
    }
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
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern content')
  })

  it('should route /watch/modern/subpath to WATCH_MODERN_PROXY_DEST with path modification', async () => {
    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/video/123' })
      .reply(200, 'modern subpath content')

    const res = await app.request(
      'http://localhost/watch/modern/video/123',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern subpath content')
  })

  it('should route /watch/modern/_next/test.css to WATCH_MODERN_PROXY_DEST with path modification', async () => {
    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/_next/test.css' })
      .reply(200, 'css content')

    const res = await app.request(
      'http://localhost/watch/modern/_next/test.css',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('css content')
  })

  it('should route /watch/modern-test to WATCH_MODERN_PROXY_DEST (no path modification)', async () => {
    fetchMock
      .get('http://modern.example.com')
      .intercept({ path: '/watch/modern-test' })
      .reply(200, 'modern test content')

    const res = await app.request(
      'http://localhost/watch/modern-test',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('modern test content')
  })

  it('should NOT route /watch/modern-test-other to WATCH_MODERN_PROXY_DEST', async () => {
    fetchMock
      .get('http://test.example.com')
      .intercept({ path: '/watch/modern-test-other' })
      .reply(200, 'legacy content')

    const res = await app.request(
      'http://localhost/watch/modern-test-other',
      {},
      {
        WATCH_PROXY_DEST: 'test.example.com',
        WATCH_MODERN_PROXY_DEST: 'modern.example.com',
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
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
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
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
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
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
          '^/watch/modern/',
          '^/watch/modern-test$'
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
        WATCH_MODERN_PROXY_PATHS: [
          '^/watch/modern$',
          '^/watch/modern/',
          '^/watch/modern-test$'
        ]
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
