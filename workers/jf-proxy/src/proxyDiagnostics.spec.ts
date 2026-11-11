import { createWatchProxyFetch } from './proxyDiagnostics'

import app from '.'

const env = { WATCH_PROXY_DEST: 'watch.example.com' }
const ray = 'a4d263cd293bea36'
const documentHeaders = { accept: 'text/html', 'cf-ray': `${ray}-IAD` }

function captureLogs() {
  // The Workers test pool replaces console between hooks and test callbacks.
  const log = vi.spyOn(console, 'info').mockImplementation(() => undefined)
  vi.spyOn(console, 'error').mockImplementation(() => undefined)
  return {
    log,
    records: (): Record<string, string | number>[] =>
      log.mock.calls.map(([value]) => JSON.parse(value))
  }
}

function deferred<T>(): {
  promise: Promise<T>
  resolve: (value: T) => void
} {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => {
    resolve = resolvePromise
  })
  return { promise, resolve }
}

describe('Watch proxy diagnostics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('defers fetching until invoked and returns the original response after logging metadata', async () => {
    const { log, records } = captureLogs()
    const originalResponse = new Response('private response body', {
      headers: { 'x-railway-request-id': 'railway-request-123' }
    })
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(originalResponse)
    const proxyFetch = createWatchProxyFetch(
      new Request('https://www.jesusfilm.org/watch', {
        headers: documentHeaders
      })
    )

    expect(fetch).not.toHaveBeenCalled()
    expect(log).not.toHaveBeenCalled()

    const result = await proxyFetch(
      'upstream',
      'https://watch.example.com/watch'
    )

    expect(fetch).toHaveBeenCalledExactlyOnceWith(
      'https://watch.example.com/watch',
      undefined
    )
    expect(records().map((record) => record.outcome)).toEqual([
      'started',
      'response'
    ])
    expect(records()[1]).toEqual({
      event: 'watch_proxy.fetch',
      request_kind: 'document',
      ray_id: ray,
      stage: 'upstream',
      outcome: 'response',
      elapsed_ms: 0,
      status_code: 200,
      railway_request_id: 'railway-request-123'
    })
    expect(result).toBe(originalResponse)
    expect(result.bodyUsed).toBe(false)
    expect(await result.text()).toBe('private response body')
  })

  it('identifies a pending upstream before any response and preserves its later response', async () => {
    const { log, records } = captureLogs()
    const upstream = deferred<Response>()
    vi.spyOn(globalThis, 'fetch').mockReturnValue(upstream.promise)
    const response = app.request(
      'https://www.jesusfilm.org/watch',
      { headers: documentHeaders },
      env
    )

    try {
      expect(records()).toEqual([
        {
          event: 'watch_proxy.fetch',
          request_kind: 'document',
          ray_id: ray,
          stage: 'upstream',
          outcome: 'started',
          elapsed_ms: 0
        }
      ])
      await vi.advanceTimersByTimeAsync(31_000)
      expect(records()).toHaveLength(1)
    } finally {
      upstream.resolve(
        new Response('watch page', {
          headers: {
            'x-railway-request-id': 'JKl5zlAsSh6nGzVejq4OvQ',
            'x-nextjs-cache': 'HIT'
          }
        })
      )
    }
    const result = await response
    expect(result.status).toBe(200)
    expect(result.headers.get('x-nextjs-cache')).toBe('HIT')
    expect(await result.text()).toBe('watch page')
    expect(log).toHaveBeenLastCalledWith(
      JSON.stringify({
        event: 'watch_proxy.fetch',
        request_kind: 'document',
        ray_id: ray,
        stage: 'upstream',
        outcome: 'response',
        elapsed_ms: 31_000,
        status_code: 200,
        railway_request_id: 'JKl5zlAsSh6nGzVejq4OvQ'
      })
    )
  })

  it('identifies a pending fallback after a Watch 500 and times each stage separately', async () => {
    const { records } = captureLogs()
    const upstream = deferred<Response>()
    const fallback = deferred<Response>()
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(upstream.promise)
      .mockReturnValueOnce(fallback.promise)
    const response = app.request(
      'https://www.jesusfilm.org/watch',
      {
        headers: documentHeaders
      },
      env
    )

    try {
      await vi.advanceTimersByTimeAsync(50)
      upstream.resolve(new Response('upstream failed', { status: 500 }))
      await vi.advanceTimersByTimeAsync(0)
      expect(records()).toEqual([
        expect.objectContaining({
          stage: 'upstream',
          outcome: 'started',
          elapsed_ms: 0
        }),
        expect.objectContaining({
          stage: 'upstream',
          outcome: 'response',
          elapsed_ms: 50,
          status_code: 500
        }),
        expect.objectContaining({
          stage: 'fallback',
          outcome: 'started',
          elapsed_ms: 0
        })
      ])
      expect(fetch).toHaveBeenLastCalledWith(
        'https://www.jesusfilm.org/not-found.html',
        expect.objectContaining({ method: 'GET', redirect: 'manual' })
      )
      await vi.advanceTimersByTimeAsync(31_000)
      expect(records()).toHaveLength(3)
    } finally {
      upstream.resolve(new Response('upstream failed', { status: 500 }))
      fallback.resolve(new Response('legacy page', { status: 404 }))
    }
    const result = await response
    expect(result.status).toBe(404)
    expect(await result.text()).toBe('legacy page')
    expect(records()[3]).toEqual(
      expect.objectContaining({
        stage: 'fallback',
        outcome: 'response',
        elapsed_ms: 31_000,
        status_code: 404,
        ray_id: ray
      })
    )
  })

  it.each([
    ['document', { accept: 'text/html,application/xhtml+xml' }],
    ['rsc', { rsc: '1' }],
    ['rsc', { accept: 'text/x-component' }],
    ['prefetch', { rsc: '1', 'next-router-prefetch': '1' }]
  ] as const)(
    'classifies %s requests without logging their URLs or private headers',
    async (kind, headers) => {
      const { records } = captureLogs()
      const fetch = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(new Response('page'))
      await app.request(
        'https://www.jesusfilm.org/watch/private-video?token=private-query',
        {
          headers: {
            ...headers,
            'cf-ray': `${ray}-IAD`,
            authorization: 'Bearer private-token',
            cookie: 'private-cookie'
          }
        },
        env
      )
      expect(records()).toEqual([
        {
          event: 'watch_proxy.fetch',
          request_kind: kind,
          ray_id: ray,
          stage: 'upstream',
          outcome: 'started',
          elapsed_ms: 0
        },
        {
          event: 'watch_proxy.fetch',
          request_kind: kind,
          ray_id: ray,
          stage: 'upstream',
          outcome: 'response',
          elapsed_ms: 0,
          status_code: 200
        }
      ])
      // Existing correlation headers still reach the upstream unchanged.
      const forwardedRequest = fetch.mock.calls[0][0] as Request
      expect(forwardedRequest.headers.get('cf-ray')).toBe(`${ray}-IAD`)
      expect(forwardedRequest.headers.get('x-forwarded-host')).toBe(
        'www.jesusfilm.org'
      )
      expect(forwardedRequest.redirect).toBe('manual')
    }
  )

  it.each([
    ['/resources', 'GET', 'text/html'],
    ['/watching', 'GET', 'text/html'],
    ['/watch/_next/image', 'GET', 'text/html'],
    ['/watch/_next/static/chunk.js', 'GET', '*/*'],
    ['/watch/api/search', 'GET', 'text/html'],
    ['/watch/transcript.vtt', 'GET', 'text/vtt'],
    ['/watch', 'GET', '*/*'],
    ['/watch', 'HEAD', 'text/html'],
    ['/watch', 'POST', 'text/html']
  ])('leaves %s %s (%s) outside diagnostics', async (path, method, accept) => {
    const { log } = captureLogs()
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('unchanged'))
    const response = await app.request(
      `https://www.jesusfilm.org${path}`,
      { method, headers: { accept } },
      env
    )
    expect(response.status).toBe(200)
    expect(fetch).toHaveBeenCalledTimes(1)
    expect(log).not.toHaveBeenCalled()
  })

  it.each([404, 500])(
    'preserves the Watch %s response/fallback contract',
    async (status) => {
      const { records } = captureLogs()
      const fetch = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce(new Response('original', { status }))
        .mockResolvedValueOnce(new Response('legacy', { status: 200 }))
      const response = await app.request(
        'https://www.jesusfilm.org/watch',
        { headers: documentHeaders },
        env
      )
      expect(response.status).toBe(status === 404 ? 404 : 200)
      expect(await response.text()).toBe(status === 404 ? 'original' : 'legacy')
      expect(fetch).toHaveBeenCalledTimes(status === 404 ? 1 : 2)
      expect(records()).toHaveLength(status === 404 ? 2 : 4)
    }
  )

  it.each(['upstream', 'fallback'] as const)(
    'records a %s fetch error without adding error details or changing its response',
    async (stage) => {
      const { records } = captureLogs()
      const fetch = vi.spyOn(globalThis, 'fetch')
      if (stage === 'fallback')
        fetch.mockResolvedValueOnce(new Response(null, { status: 500 }))
      fetch.mockRejectedValueOnce(new Error('private-error-url?token=secret'))
      const response = await app.request(
        'https://www.jesusfilm.org/watch',
        { headers: documentHeaders },
        env
      )
      expect(response.status).toBe(stage === 'upstream' ? 503 : 404)
      expect(records().at(-1)).toEqual({
        event: 'watch_proxy.fetch',
        request_kind: 'document',
        ray_id: ray,
        stage,
        outcome: 'error',
        elapsed_ms: 0
      })
      expect(JSON.stringify(records())).not.toContain('private-error')
    }
  )

  it.each([
    ['invalid-private-ray', 'invalid/private-railway'],
    ['a'.repeat(1000), 'b'.repeat(1000)],
    ['', '']
  ])(
    'omits malformed or oversized correlation IDs',
    async (rayId, railwayId) => {
      const { records } = captureLogs()
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(null, { headers: { 'x-railway-request-id': railwayId } })
      )
      await app.request(
        'https://www.jesusfilm.org/watch',
        { headers: { accept: 'text/html', 'cf-ray': rayId } },
        env
      )
      for (const record of records()) {
        expect(record).not.toHaveProperty('ray_id')
        expect(record).not.toHaveProperty('railway_request_id')
      }
    }
  )

  it('returns response headers while the body is still streaming', async () => {
    const { records } = captureLogs()
    const stream = new TransformStream<Uint8Array, Uint8Array>()
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(stream.readable, { headers: { 'x-nextjs-cache': 'HIT' } })
    )
    const response = await app.request(
      'https://www.jesusfilm.org/watch',
      { headers: documentHeaders },
      env
    )
    expect(response.headers.get('x-nextjs-cache')).toBe('HIT')
    expect(response.bodyUsed).toBe(false)
    expect(records().at(-1)).toEqual(
      expect.objectContaining({ outcome: 'response', status_code: 200 })
    )
    const body = response.text()
    const writer = stream.writable.getWriter()
    await writer.write(new TextEncoder().encode('streamed page'))
    await writer.close()
    expect(await body).toBe('streamed page')
  })

  it('keeps concurrent request IDs and elapsed times separate', async () => {
    const { records } = captureLogs()
    const first = deferred<Response>()
    const secondRay = 'a4d119ed7867277b'
    vi.spyOn(globalThis, 'fetch')
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(new Response('second'))
    const firstResponse = app.request(
      'https://www.jesusfilm.org/watch',
      { headers: documentHeaders },
      env
    )
    try {
      await vi.advanceTimersByTimeAsync(100)
      await app.request(
        'https://www.jesusfilm.org/watch',
        { headers: { ...documentHeaders, 'cf-ray': secondRay } },
        env
      )
      expect(records().at(-1)).toEqual(
        expect.objectContaining({ ray_id: secondRay, elapsed_ms: 0 })
      )
    } finally {
      first.resolve(new Response('first'))
    }
    await firstResponse
    expect(records().at(-1)).toEqual(
      expect.objectContaining({ ray_id: ray, elapsed_ms: 100 })
    )
  })

  it('preserves a successful response when the log sink throws', async () => {
    const { log } = captureLogs()
    log.mockImplementation(() => {
      throw new Error('log unavailable')
    })
    const fetch = vi
      .spyOn(globalThis, 'fetch')
      .mockResolvedValue(new Response('page'))
    const response = await app.request(
      'https://www.jesusfilm.org/watch',
      { headers: documentHeaders },
      env
    )
    expect(response.status).toBe(200)
    expect(await response.text()).toBe('page')
    expect(fetch).toHaveBeenCalledTimes(1)
  })
})
