import { vi } from 'vitest'

import {
  MAX_REDIRECTS,
  checkDestination,
  classifyError,
  classifyStatus
} from './checkDestination'

const fetchMock = vi.fn()

function response(
  status: number,
  headers: Record<string, string> = {}
): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(headers),
    body: { cancel: vi.fn().mockResolvedValue(undefined) }
  } as unknown as Response
}

describe('checkDestination', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('classifyStatus', () => {
    it('maps statuses to health', () => {
      expect(classifyStatus(200)).toBe('ok')
      expect(classifyStatus(403)).toBe('ok')
      expect(classifyStatus(404)).toBe('notFound')
      expect(classifyStatus(410)).toBe('notFound')
      expect(classifyStatus(500)).toBe('serverError')
      expect(classifyStatus(503)).toBe('serverError')
    })
  })

  describe('classifyError', () => {
    it('reads undici cause chains', () => {
      const wrap = (cause: object): Error =>
        Object.assign(new TypeError('fetch failed'), { cause })
      expect(classifyError(wrap({ code: 'ENOTFOUND' }))).toBe('dns')
      expect(classifyError(wrap({ code: 'EAI_AGAIN' }))).toBe('dns')
      expect(classifyError(wrap({ code: 'CERT_HAS_EXPIRED' }))).toBe('tls')
      expect(
        classifyError(wrap({ code: 'ERR_TLS_CERT_ALTNAME_INVALID' }))
      ).toBe('tls')
      expect(classifyError(wrap({ code: 'ERR_TOO_MANY_REDIRECTS' }))).toBe(
        'redirectLoop'
      )
      expect(classifyError(wrap({ code: 'ECONNRESET' }))).toBe('unknown')
    })

    it('treats aborts as timeouts', () => {
      const abort = new Error('aborted')
      abort.name = 'AbortError'
      expect(classifyError(abort)).toBe('timeout')
    })
  })

  it('returns ok on a 2xx HEAD without a GET', async () => {
    fetchMock.mockResolvedValueOnce(response(200))
    expect(await checkDestination('https://ok.example')).toBe('ok')
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(fetchMock.mock.calls[0][1]).toMatchObject({
      method: 'HEAD',
      redirect: 'manual'
    })
  })

  describe('Watch admission-only health contract', () => {
    const contractHeaders = { 'x-watch-destination-health': 'v1' }

    it.each([
      'https://www.jesusfilm.org/watch/jesus.html/english.html',
      'https://www.jesusfilm.org/watch/jesus.html/birth-of-jesus/french.html',
      'https://www.jesusfilm.org/watch',
      'https://www.jesusfilm.org/watch/languages'
    ])('does not request HTML for an admitted destination: %s', async (url) => {
      fetchMock.mockResolvedValueOnce(response(200, contractHeaders))
      expect(await checkDestination(url)).toBe('ok')
      expect(fetchMock).toHaveBeenCalledTimes(1)
      const calledUrl = new URL(fetchMock.mock.calls[0][0])
      expect(calledUrl.origin).toBe(new URL(url).origin)
      expect(calledUrl.pathname).toBe('/watch/api/watch-destination-health')
      expect(calledUrl.searchParams.get('path')).toBe(new URL(url).pathname)
      expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: 'GET' })
    })

    it.each([
      [404, 'notFound'],
      [503, 'serverError'],
      [400, 'serverError'],
      [403, 'serverError']
    ])(
      'preserves contract failure status %s without downloading HTML',
      async (status, health) => {
        fetchMock.mockResolvedValueOnce(response(status, contractHeaders))
        expect(
          await checkDestination('https://www.jesusfilm.org/watch/missing.html')
        ).toBe(health)
        expect(fetchMock).toHaveBeenCalledTimes(1)
      }
    )

    it.each([200, 404, 403, 503])(
      'falls back to the destination when endpoint status %s lacks the contract',
      async (status) => {
        fetchMock
          .mockResolvedValueOnce(response(status))
          .mockResolvedValueOnce(response(200))
        const url = 'https://www.jesusfilm.org/watch/jesus.html'
        expect(await checkDestination(url)).toBe('ok')
        expect(fetchMock.mock.calls[1]).toEqual([
          url,
          expect.objectContaining({ method: 'HEAD' })
        ])
      }
    )

    it.each([
      'http://www.jesusfilm.org/watch/jesus.html',
      'https://www.jesusfilm.org:8443/watch/jesus.html',
      'https://www.jesusfilm.org.attacker.example/watch/jesus.html',
      'https://attacker.example/watch/jesus.html',
      'https://www.jesusfilm.org/watch/jesus.html?preview=1',
      'https://www.jesusfilm.org/watch/jesus.html?utm_source=shortlink',
      'https://www.jesusfilm.org/watch/api/download',
      'https://www.jesusfilm.org/watch/preview/experience/token',
      'https://www.jesusfilm.org/about'
    ])(
      'retains the normal HTTP check outside the narrow contract: %s',
      async (url) => {
        fetchMock.mockResolvedValueOnce(response(200))
        expect(await checkDestination(url)).toBe('ok')
        expect(fetchMock).toHaveBeenCalledTimes(1)
        expect(fetchMock.mock.calls[0]).toEqual([
          url,
          expect.objectContaining({ method: 'HEAD' })
        ])
      }
    )
  })

  it('follows redirects manually', async () => {
    fetchMock
      .mockResolvedValueOnce(response(301, { location: '/moved' }))
      .mockResolvedValueOnce(response(200))
    expect(await checkDestination('https://ok.example/a')).toBe('ok')
    expect(fetchMock.mock.calls[1][0]).toBe('https://ok.example/moved')
  })

  it('falls back to GET when HEAD is not allowed', async () => {
    fetchMock
      .mockResolvedValueOnce(response(405))
      .mockResolvedValueOnce(response(200))
    expect(await checkDestination('https://ok.example')).toBe('ok')
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: 'GET' })
  })

  it('confirms a 404 with GET before reporting notFound', async () => {
    fetchMock
      .mockResolvedValueOnce(response(404))
      .mockResolvedValueOnce(response(404))
    expect(await checkDestination('https://gone.example')).toBe('notFound')
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })

  it('reports serverError on 5xx', async () => {
    fetchMock
      .mockResolvedValueOnce(response(500))
      .mockResolvedValueOnce(response(503))
    expect(await checkDestination('https://down.example')).toBe('serverError')
  })

  it('reports redirectLoop after too many hops', async () => {
    fetchMock.mockImplementation(async () =>
      response(302, { location: 'https://loop.example/again' })
    )
    expect(await checkDestination('https://loop.example')).toBe('redirectLoop')
    expect(fetchMock).toHaveBeenCalledTimes(MAX_REDIRECTS + 1)
  })

  it('reports dns / tls / timeout from thrown errors', async () => {
    fetchMock.mockRejectedValueOnce(
      Object.assign(new TypeError('fetch failed'), {
        cause: { code: 'ENOTFOUND' }
      })
    )
    expect(await checkDestination('https://nope.example')).toBe('dns')

    fetchMock.mockRejectedValueOnce(
      Object.assign(new TypeError('fetch failed'), {
        cause: { code: 'DEPTH_ZERO_SELF_SIGNED_CERT' }
      })
    )
    expect(await checkDestination('https://selfsigned.example')).toBe('tls')

    const abort = new Error('aborted')
    abort.name = 'AbortError'
    fetchMock.mockRejectedValueOnce(abort)
    expect(await checkDestination('https://slow.example')).toBe('timeout')
  })
})
