import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import fetch from 'node-fetch'

import handler from './preview-template-gallery'

jest.mock('node-fetch', () => jest.fn())
jest.mock('next-firebase-auth-edge', () => ({
  getApiRequestTokens: jest.fn()
}))

const mockFetch = fetch as unknown as jest.Mock
const mockGetApiRequestTokens = getApiRequestTokens as unknown as jest.Mock

interface CapturedRes {
  res: NextApiResponse
  status: jest.Mock
  json: jest.Mock
  redirect: jest.Mock
}

function mockResponse(): CapturedRes {
  const json = jest.fn()
  const status = jest.fn(() => ({ json }))
  const redirect = jest.fn()
  const res = { status, json, redirect } as unknown as NextApiResponse
  return { res, status, json, redirect }
}

// Default request shape: top-level GET with Sec-Fetch-Site omitted
// (matching a browser-typed-URL navigation, which is the legitimate
// admin-paste case). Specific tests override headers / method.
function previewReq(
  query: Record<string, string | undefined> = { slug: 'my-collection' },
  overrides: { method?: string; headers?: Record<string, string> } = {}
): NextApiRequest {
  return {
    method: overrides.method ?? 'GET',
    headers: overrides.headers ?? {},
    query
  } as unknown as NextApiRequest
}

describe('preview-template-gallery', () => {
  const ORIGINAL_JOURNEYS_URL = process.env.JOURNEYS_URL
  const ORIGINAL_TOKEN = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  let consoleWarn: jest.SpyInstance

  beforeEach(() => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'valid-token'
    mockFetch.mockReset()
    mockFetch.mockResolvedValue({ ok: true, status: 200 } as never)
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
    consoleWarn = jest.spyOn(console, 'warn').mockImplementation(jest.fn())
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_JOURNEYS_URL
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ORIGINAL_TOKEN
    consoleWarn.mockRestore()
  })

  // P1-B regression guard: non-GET requests are rejected before any
  // side-effect (Firebase auth check, upstream revalidate, redirect).
  // Mirrors the revalidate-proxy method gate; without this, a stolen-
  // cookie victim could be steered into POSTing the URL.
  it.each([['POST'], ['PUT'], ['DELETE'], ['PATCH']])(
    'returns 405 for %s requests',
    async (method) => {
      const { res, status, json, redirect } = mockResponse()
      await handler(previewReq({ slug: 'my-collection' }, { method }), res)
      expect(redirect).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(405)
      expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    }
  )

  // P1-B regression guard: cross-site `Sec-Fetch-Site` is rejected so a
  // hostile third-party page cannot use a stolen admin cookie to spin
  // up revalidate side-effects via a navigated <a> / <img>.
  it('returns 403 when Sec-Fetch-Site is cross-site', async () => {
    const { res, status, json, redirect } = mockResponse()
    await handler(
      previewReq(
        { slug: 'my-collection' },
        { headers: { 'sec-fetch-site': 'cross-site' } }
      ),
      res
    )
    expect(redirect).not.toHaveBeenCalled()
    expect(mockFetch).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('returns 403 when Sec-Fetch-Site is same-site (different subdomain)', async () => {
    // `same-site` covers admin.example.com → public.example.com which
    // we do NOT want to allow — admin should hit the preview proxy from
    // its own origin only.
    const { res, status, redirect } = mockResponse()
    await handler(
      previewReq(
        { slug: 'my-collection' },
        { headers: { 'sec-fetch-site': 'same-site' } }
      ),
      res
    )
    expect(redirect).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(403)
  })

  it('allows same-origin Sec-Fetch-Site requests', async () => {
    const { res, redirect } = mockResponse()
    await handler(
      previewReq(
        { slug: 'my-collection' },
        { headers: { 'sec-fetch-site': 'same-origin' } }
      ),
      res
    )
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  it('allows requests without Sec-Fetch-Site (legacy browsers / address-bar typing)', async () => {
    const { res, redirect } = mockResponse()
    await handler(previewReq(), res)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  it('returns 500 when JOURNEYS_URL env var is missing', async () => {
    delete process.env.JOURNEYS_URL
    const { res, status, json } = mockResponse()
    await handler(previewReq(), res)
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 500 when JOURNEYS_REVALIDATE_ACCESS_TOKEN env var is missing', async () => {
    delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    const { res, status, json } = mockResponse()
    await handler(previewReq(), res)
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 403 when getApiRequestTokens resolves null', async () => {
    mockGetApiRequestTokens.mockResolvedValueOnce(null)
    const { res, status, json } = mockResponse()
    await handler(previewReq(), res)
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('returns 403 when getApiRequestTokens throws', async () => {
    mockGetApiRequestTokens.mockRejectedValueOnce(new Error('boom'))
    const { res, status, json } = mockResponse()
    await handler(previewReq(), res)
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('returns 400 when slug is missing', async () => {
    const { res, status, json } = mockResponse()
    await handler(previewReq({}), res)
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it.each([
    ['../foo'],
    ['foo/bar'],
    ['foo?next=evil'],
    [''],
    ['Foo'],
    ['foo bar']
  ])(
    'returns 400 and does not redirect for malformed slug %j',
    async (badSlug) => {
      const { res, status, json, redirect } = mockResponse()
      await handler(previewReq({ slug: badSlug }), res)
      expect(redirect).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
    }
  )

  it('revalidates the upstream slug before issuing the 307 redirect', async () => {
    const { res, redirect } = mockResponse()
    await handler(previewReq(), res)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const [revalidateUrl] = mockFetch.mock.calls[0] as [string]
    expect(revalidateUrl).toContain(
      'https://your.nextstep.is/api/revalidate-template-gallery'
    )
    expect(revalidateUrl).toContain('slug=my-collection')
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  // P1-A regression guard: the token MUST ride in the Authorization
  // header, never in the URL.
  it('sends the access token in the Authorization header and never in the URL', async () => {
    const { res } = mockResponse()
    await handler(previewReq(), res)

    const [fetchUrl, fetchInit] = mockFetch.mock.calls[0] as [
      string,
      { headers?: Record<string, string> }
    ]
    expect(fetchUrl).not.toContain('accessToken')
    expect(fetchInit.headers).toEqual({
      Authorization: 'Bearer valid-token'
    })
  })

  it('awaits the revalidate fetch before redirecting', async () => {
    let resolveFetch: (value: unknown) => void = () => {
      throw new Error('resolveFetch must be assigned synchronously')
    }
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    mockFetch.mockReturnValueOnce(pending)

    const { res, redirect } = mockResponse()
    const handlerPromise = handler(previewReq(), res)
    await Promise.resolve()
    expect(mockFetch).toHaveBeenCalledTimes(1)
    expect(redirect).not.toHaveBeenCalled()

    resolveFetch({ ok: true, status: 200 })
    await handlerPromise

    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  it('still redirects when the revalidate upstream returns non-2xx (graceful fallback)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 502 } as never)
    const { res, redirect } = mockResponse()
    await handler(previewReq(), res)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('revalidate upstream returned 502')
    )
  })

  it('still redirects when the revalidate fetch throws (graceful fallback)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'))
    const { res, redirect } = mockResponse()
    await handler(previewReq(), res)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
    expect(consoleWarn).toHaveBeenCalledWith(
      expect.stringContaining('revalidate fetch threw'),
      'network down'
    )
  })
})
