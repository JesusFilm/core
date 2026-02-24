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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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

  it('should route /watch path with EXPERIMENTAL cookie to WATCH_PROXY_DEST', async () => {
    fetchMock
      .get('http://watch.example.com')
      .intercept({ path: '/watch' })
      .reply(200, 'watch content')

    const res = await app.request(
      'http://localhost/watch',
      {
        headers: {
          cookie: 'EXPERIMENTAL=true'
        }
      },
      {
        RESOURCES_PROXY_DEST: 'resources.example.com',
        WATCH_PROXY_DEST: 'watch.example.com'
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('watch content')
  })

  it('should route /watch path without EXPERIMENTAL cookie to RESOURCES_PROXY_DEST', async () => {
    fetchMock
      .get('http://resources.example.com')
      .intercept({ path: '/watch' })
      .reply(200, 'resources content')

    const res = await app.request(
      'http://localhost/watch',
      {},
      {
        RESOURCES_PROXY_DEST: 'resources.example.com',
        WATCH_PROXY_DEST: 'watch.example.com'
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('resources content')
  })

  it('should route /watch/subpath with EXPERIMENTAL cookie to WATCH_PROXY_DEST', async () => {
    fetchMock
      .get('http://watch.example.com')
      .intercept({ path: '/watch/video/123' })
      .reply(200, 'watch video content')

    const res = await app.request(
      'http://localhost/watch/video/123',
      {
        headers: {
          cookie: 'EXPERIMENTAL=true; other=value'
        }
      },
      {
        RESOURCES_PROXY_DEST: 'resources.example.com',
        WATCH_PROXY_DEST: 'watch.example.com'
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('watch video content')
  })

  it('should route /watch/subpath without EXPERIMENTAL cookie to RESOURCES_PROXY_DEST', async () => {
    fetchMock
      .get('http://resources.example.com')
      .intercept({ path: '/watch/video/123' })
      .reply(200, 'resources video content')

    const res = await app.request(
      'http://localhost/watch/video/123',
      {
        headers: {
          cookie: 'other=value'
        }
      },
      {
        RESOURCES_PROXY_DEST: 'resources.example.com',
        WATCH_PROXY_DEST: 'watch.example.com'
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('resources video content')
  })

  it('should route non-/watch paths to RESOURCES_PROXY_DEST regardless of cookie', async () => {
    fetchMock
      .get('http://resources.example.com')
      .intercept({ path: '/api/test' })
      .reply(200, 'api content')

    const res = await app.request(
      'http://localhost/api/test',
      {
        headers: {
          cookie: 'EXPERIMENTAL=true'
        }
      },
      {
        RESOURCES_PROXY_DEST: 'resources.example.com',
        WATCH_PROXY_DEST: 'watch.example.com'
      }
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('api content')
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
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
      { RESOURCES_PROXY_DEST: 'test.example.com' }
    )
    expect(res.status).toBe(404)
    expect(await res.text()).toBe('Not Found')
  })

  it('should handle missing RESOURCES_PROXY_DEST binding', async () => {
    fetchMock
      .get('http://localhost')
      .intercept({ path: '/test-path%aa' })
      .reply(200, 'original host content')

    const res = await app.request(
      'http://localhost/test-path%AA',
      {},
      {} // No RESOURCES_PROXY_DEST binding
    )
    expect(res.status).toBe(200)
    expect(await res.text()).toBe('original host content')
  })

  it.each([
    ['/.well-known/apple-app-site-association'],
    ['/apple-app-site-association']
  ])('should return AASA with application/json for %s', async (path) => {
    const res = await app.request(
      `http://localhost${path}`,
      {},
      { IOS_APP_ID: 'DQ48D9BF2V.com.InspirationalFilms.JesusFilm' }
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
    const body = await res.json()
    expect(body.applinks.details[0].appID).toBe(
      'DQ48D9BF2V.com.InspirationalFilms.JesusFilm'
    )
    expect(body.applinks.details[0].paths).toEqual(['*', '/'])
  })

  it.each([
    ['/.well-known/apple-app-site-association'],
    ['/apple-app-site-association']
  ])(
    'should return 500 for AASA at %s when IOS_APP_ID not configured',
    async (path) => {
      const res = await app.request(`http://localhost${path}`, {}, {})
      expect(res.status).toBe(500)
    }
  )

  it('should return assetlinks for /.well-known/assetlinks.json', async () => {
    const res = await app.request(
      'http://localhost/.well-known/assetlinks.json',
      {},
      {
        ANDROID_PACKAGE_NAME: 'com.jesusfilmmedia.android.jesusfilm.debug',
        ANDROID_SHA256_CERT_FINGERPRINT:
          'F3:9F:C4:4D:42:F5:25:90:CD:4D:75:67:2C:9F:5F:B1:1B:6A:61:9B:C6:ED:65:CA:2E:39:03:82:3C:E8:50:D1'
      }
    )
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toBe('application/json')
    expect(res.headers.get('Cache-Control')).toContain('max-age=86400')
    const body = await res.json()
    expect(body[0].target.package_name).toBe(
      'com.jesusfilmmedia.android.jesusfilm.debug'
    )
    expect(body[0].target.sha256_cert_fingerprints[0]).toBe(
      'F3:9F:C4:4D:42:F5:25:90:CD:4D:75:67:2C:9F:5F:B1:1B:6A:61:9B:C6:ED:65:CA:2E:39:03:82:3C:E8:50:D1'
    )
  })

  it('should return 500 for assetlinks when env vars not configured', async () => {
    const res = await app.request(
      'http://localhost/.well-known/assetlinks.json',
      {},
      {}
    )
    expect(res.status).toBe(500)
  })
})
