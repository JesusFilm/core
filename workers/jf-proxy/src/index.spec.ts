import { fetchMock } from 'cloudflare:test'

import app from '.'

const graphQlEndpoint = 'http://graphql.example.com'

function decodeRequestBody(body: unknown): string {
  if (typeof body === 'string') return body
  if (body instanceof Uint8Array) return new TextDecoder().decode(body)
  if (body instanceof ArrayBuffer) {
    return new TextDecoder().decode(new Uint8Array(body))
  }
  throw new TypeError('Expected the intercepted request to have a text body')
}

function workerEnv(
  overrides: Record<string, string | undefined> = {}
): Record<string, string | undefined> {
  return {
    RESOURCES_PROXY_DEST: 'resources.example.com',
    WATCH_PROXY_DEST: 'watch.example.com',
    CORE_GRAPHQL_ENDPOINT: graphQlEndpoint,
    ...overrides
  }
}

function expectGraphQlRequest(
  responseData: unknown,
  assertBody?: (body: {
    query?: string
    variables?: Record<string, unknown>
  }) => void
): void {
  fetchMock
    .get(graphQlEndpoint)
    .intercept({ path: '/', method: 'POST' })
    .reply(({ body }) => {
      const bodyText = decodeRequestBody(body)
      const requestBody = JSON.parse(bodyText)
      assertBody?.(requestBody)
      return {
        statusCode: 200,
        data: JSON.stringify({
          data: responseData
        }),
        responseOptions: {
          headers: { 'Content-Type': 'application/json' }
        }
      }
    })
}

describe('test the worker', () => {
  beforeAll(() => {
    fetchMock.activate()
    fetchMock.disableNetConnect()
  })

  afterEach(() => fetchMock.assertNoPendingInterceptors())

  describe('JF watch ID redirect', () => {
    it('should redirect from cold cache after resolving video and language slugs', async () => {
      expectGraphQlRequest(
        {
          videos: [{ slug: 'jesus' }],
          languages: [{ slug: 'english' }]
        },
        ({ query, variables }) => {
          expect(query).toContain('videos(where: { ids: $videoIds }')
          expect(query).toContain('languages(where: { ids: $languageIds }')
          expect(variables).toEqual({
            videoIds: ['cold-video-1'],
            languageIds: ['cold-language-1']
          })
        }
      )

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/cold-video-1/cold-language-1',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe('/watch/jesus.html/english.html')
    })

    it('should normalize optional html suffixes before cache and GraphQL lookup', async () => {
      expectGraphQlRequest(
        {
          videos: [{ slug: 'suffix-video' }],
          languages: [{ slug: 'suffix-language' }]
        },
        ({ variables }) => {
          expect(variables).toEqual({
            videoIds: ['suffix-video-id'],
            languageIds: ['529']
          })
        }
      )

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/suffix-video-id.html/529.htm',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/suffix-video.html/suffix-language.html'
      )
    })

    it('should also own the legacy api resolver path', async () => {
      expectGraphQlRequest({
        videos: [{ slug: 'api-video' }],
        languages: [{ slug: 'api-language' }]
      })

      const res = await app.request(
        'http://localhost/api/jf/watch.html/api-video-id/api-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/api-video.html/api-language.html'
      )
    })

    it('should redirect when the incoming route has a trailing slash', async () => {
      expectGraphQlRequest({
        videos: [{ slug: 'trailing-video' }],
        languages: [{ slug: 'trailing-language' }]
      })

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/trailing-video-id/trailing-language-id/',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/trailing-video.html/trailing-language.html'
      )
    })

    it('should return service unavailable when the slug lookup times out', async () => {
      fetchMock
        .get(graphQlEndpoint)
        .intercept({ path: '/', method: 'POST' })
        .replyWithError(new Error('The operation was aborted'))

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/timeout-video-id/timeout-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(503)
    })

    it('should fetch only the missing language slug when video slug is cached', async () => {
      expectGraphQlRequest(
        {
          languages: [{ slug: 'partial-language' }]
        },
        ({ query, variables }) => {
          expect(query).not.toContain('videos(where: { ids: $videoIds }')
          expect(query).toContain('languages(where: { ids: $languageIds }')
          expect(variables).toEqual({
            languageIds: ['partial-language-id']
          })
        }
      )

      await caches.default.put(
        'https://jf-proxy.local/cache/jf-watch/video/partial-video-id',
        new Response('partial-video', {
          headers: { 'Cache-Control': 'public, max-age=86400' }
        })
      )

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/partial-video-id/partial-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/partial-video.html/partial-language.html'
      )
    })

    it('should fetch only the missing video slug when language slug is cached', async () => {
      await caches.default.put(
        'https://jf-proxy.local/cache/jf-watch/language/cached-language-id',
        new Response('cached-language', {
          headers: { 'Cache-Control': 'public, max-age=86400' }
        })
      )

      expectGraphQlRequest(
        {
          videos: [{ slug: 'missing-video' }]
        },
        ({ query, variables }) => {
          expect(query).toContain('videos(where: { ids: $videoIds }')
          expect(query).not.toContain('languages(where: { ids: $languageIds }')
          expect(variables).toEqual({
            videoIds: ['missing-video-id']
          })
        }
      )

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/missing-video-id/cached-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/missing-video.html/cached-language.html'
      )
    })

    it('should redirect from cache without GraphQL when both slugs are cached', async () => {
      await caches.default.put(
        'https://jf-proxy.local/cache/jf-watch/video/fully-cached-video-id',
        new Response('fully-cached-video', {
          headers: { 'Cache-Control': 'public, max-age=86400' }
        })
      )
      await caches.default.put(
        'https://jf-proxy.local/cache/jf-watch/language/fully-cached-language-id',
        new Response('fully-cached-language', {
          headers: { 'Cache-Control': 'public, max-age=86400' }
        })
      )

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/fully-cached-video-id/fully-cached-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(302)
      expect(res.headers.get('location')).toBe(
        '/watch/fully-cached-video.html/fully-cached-language.html'
      )
    })

    it('should return 404 and not cache when a slug cannot be resolved', async () => {
      expectGraphQlRequest({
        videos: [{ slug: 'uncached-video' }],
        languages: []
      })

      const res = await app.request(
        'http://localhost/bin/jf/watch.html/uncached-video-id/missing-language-id',
        {},
        workerEnv()
      )

      expect(res.status).toBe(404)
      expect(
        await caches.default.match(
          'https://jf-proxy.local/cache/jf-watch/language/missing-language-id'
        )
      ).toBeUndefined()
    })
  })

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

  it.each([
    ['/watch', undefined],
    ['/watching', undefined],
    ['/watch/video/123', 'other=value'],
    ['/watch/video/456', 'EXPERIMENTAL=true']
  ])(
    'should route %s to WATCH_PROXY_DEST regardless of cookies',
    async (path, cookie) => {
      fetchMock
        .get('http://watch.example.com')
        .intercept({ path })
        .reply(200, 'watch content')

      const res = await app.request(
        `http://localhost${path}`,
        cookie ? { headers: { cookie } } : {},
        workerEnv()
      )

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('watch content')
    }
  )

  it.each(['/journeys', '/journeys/123', '/resources', '/resources/'])(
    'should route %s to RESOURCES_PROXY_DEST',
    async (path) => {
      fetchMock
        .get('http://resources.example.com')
        .intercept({ path })
        .reply(200, 'resources content')

      const res = await app.request(`http://localhost${path}`, {}, workerEnv())

      expect(res.status).toBe(200)
      expect(await res.text()).toBe('resources content')
    }
  )

  it('should continue passing cookies through to WATCH_PROXY_DEST', async () => {
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

  it('should forward a Next.js server action POST to WATCH_PROXY_DEST', async () => {
    const actionBody = '1_{"query":"JESUS"}'
    let capturedBody: string | undefined
    let capturedHeaders: Headers | Record<string, string> | undefined

    fetchMock
      .get('http://watch.example.com')
      .intercept({ path: '/watch?source=synthetic', method: 'POST' })
      .reply((request) => {
        capturedBody = decodeRequestBody(request.body)
        capturedHeaders = request.headers
        return {
          statusCode: 200,
          data: '1:{"ok":true}',
          responseOptions: {
            headers: { 'Content-Type': 'text/x-component' }
          }
        }
      })

    const res = await app.request(
      'http://localhost/watch?source=synthetic',
      {
        method: 'POST',
        headers: {
          accept: 'text/x-component',
          cookie: 'forge_web_session=session-value',
          'next-action': 'action-id',
          'next-router-state-tree': '%5B%22%22%5D',
          origin: 'https://www.jesusfilm.org',
          'x-forwarded-host': 'attacker.example.com',
          'x-forwarded-proto': 'http'
        },
        body: actionBody
      },
      workerEnv()
    )

    expect(res.status).toBe(200)
    expect(res.headers.get('content-type')).toBe('text/x-component')
    expect(await res.text()).toBe('1:{"ok":true}')
    expect(capturedBody).toBe(actionBody)
    expect(capturedHeaders).toBeDefined()

    const getCapturedHeader = (name: string): string | null | undefined =>
      capturedHeaders instanceof Headers
        ? capturedHeaders.get(name)
        : capturedHeaders?.[name]

    expect(getCapturedHeader('accept')).toBe('text/x-component')
    expect(getCapturedHeader('cookie')).toBe('forge_web_session=session-value')
    expect(getCapturedHeader('next-action')).toBe('action-id')
    expect(getCapturedHeader('next-router-state-tree')).toBe('%5B%22%22%5D')
    expect(getCapturedHeader('origin')).toBe('https://www.jesusfilm.org')
    expect(getCapturedHeader('x-forwarded-host')).toBe('localhost')
    expect(getCapturedHeader('x-forwarded-proto')).toBe('http')
  })

  it.each([
    [404, 'action not found'],
    [500, 'action failed']
  ])(
    'should pass through a %s response for a non-GET Watch request',
    async (status, responseBody) => {
      fetchMock
        .get('http://watch.example.com')
        .intercept({ path: '/watch', method: 'POST' })
        .reply(status, responseBody)

      const res = await app.request(
        'http://localhost/watch',
        {
          method: 'POST',
          headers: { 'next-action': 'stale-action-id' },
          body: 'action-payload'
        },
        workerEnv()
      )

      expect(res.status).toBe(status)
      expect(await res.text()).toBe(responseBody)
    }
  )

  it('should route other worker paths to RESOURCES_PROXY_DEST', async () => {
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
