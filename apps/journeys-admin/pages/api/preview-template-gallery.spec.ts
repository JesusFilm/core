import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import { type Mock } from 'vitest'

import handler from './preview-template-gallery'

vi.mock('next-firebase-auth-edge', () => ({
  getApiRequestTokens: vi.fn()
}))

const mockGetApiRequestTokens = getApiRequestTokens as unknown as Mock

interface CapturedRes {
  res: NextApiResponse
  status: Mock
  json: Mock
  redirect: Mock
}

function mockResponse(): CapturedRes {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const redirect = vi.fn()
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

  beforeEach(() => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_JOURNEYS_URL
  })

  // Non-GET requests are rejected before any side-effect (Firebase auth
  // check, redirect). Mirrors the revalidate-proxy method gate; without
  // this, a stolen-cookie victim could be steered into POSTing the URL.
  it.each([['POST'], ['PUT'], ['DELETE'], ['PATCH']])(
    'returns 405 for %s requests',
    async (method) => {
      const { res, status, json, redirect } = mockResponse()
      await handler(previewReq({ slug: 'my-collection' }, { method }), res)
      expect(redirect).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(405)
      expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' })
    }
  )

  // Cross-site `Sec-Fetch-Site` is rejected so a hostile third-party
  // page cannot use a stolen admin cookie to drive the proxy via a
  // navigated <a> / <img>.
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
    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('returns 403 when Sec-Fetch-Site is same-site (different subdomain)', async () => {
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
      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
    }
  )

  it('rejects a malformed slug WITHOUT spending a Firebase token round-trip', async () => {
    // Slug validation must run before getApiRequestTokens so obviously
    // bad input doesn't burn an auth call (Mike review, NES-1644).
    const { res } = mockResponse()
    await handler(previewReq({ slug: '../evil' }), res)
    expect(mockGetApiRequestTokens).not.toHaveBeenCalled()
  })

  it('redirects with 307 to the public template-gallery URL on success', async () => {
    const { res, redirect } = mockResponse()
    await handler(previewReq(), res)
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })
})
