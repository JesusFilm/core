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
