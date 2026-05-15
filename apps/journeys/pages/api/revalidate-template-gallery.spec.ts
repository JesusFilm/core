import type { NextApiRequest, NextApiResponse } from 'next'
import { type Mock } from 'vitest'

import handler from './revalidate-template-gallery'

interface CapturedRes {
  res: NextApiResponse
  status: Mock
  json: Mock
  revalidate: Mock
}

function mockResponse(): CapturedRes {
  const json = vi.fn()
  const status = vi.fn(() => ({ json }))
  const revalidate = vi.fn(async () => undefined)
  const res = { status, json, revalidate } as unknown as NextApiResponse
  return { res, status, json, revalidate }
}

function bearerReq(token: string | undefined, slug: unknown): NextApiRequest {
  return {
    headers: token != null ? { authorization: `Bearer ${token}` } : {},
    query: { slug }
  } as unknown as NextApiRequest
}

describe('revalidate-template-gallery', () => {
  const ORIGINAL_TOKEN = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN

  beforeEach(() => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'valid-token'
  })

  afterEach(() => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ORIGINAL_TOKEN
    vi.clearAllMocks()
  })

  it('returns 401 when the Authorization header is missing', async () => {
    const req = bearerReq(undefined, 'my-collection')
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid access token' })
  })

  it('returns 401 when the Bearer token does not match the env value', async () => {
    const req = bearerReq('wrong-token', 'my-collection')
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid access token' })
  })

  // The compare must be constant-time. A length-mismatched string (would
  // throw `timingSafeEqual` if passed unguarded) must be rejected
  // gracefully without ever calling `revalidate`.
  it('returns 401 when Bearer token length differs from the env value', async () => {
    const req = bearerReq('too-short', 'my-collection')
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid access token' })
  })

  // P1-A regression guard. The legacy `?accessToken=...` form must be
  // rejected outright so the migration window has only one live auth
  // path. A client that hasn't updated gets an immediate 401 and the
  // regression surfaces in logs instead of silently passing through.
  it('returns 401 when accessToken is supplied as a query param (deprecated form)', async () => {
    const req = {
      headers: {},
      query: { accessToken: 'valid-token', slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({
      message: 'Access token must be supplied via Authorization: Bearer header'
    })
  })

  it('returns 401 when accessToken is supplied as a query param even with the correct header', async () => {
    // Defence-in-depth: a misconfigured client that sends BOTH still
    // hits the deprecated-path rejection. Forces operators to fix the
    // client rather than silently degrading.
    const req = {
      headers: { authorization: 'Bearer valid-token' },
      query: { accessToken: 'valid-token', slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(401)
  })

  it('returns 401 when Authorization header lacks the Bearer prefix', async () => {
    const req = {
      headers: { authorization: 'valid-token' },
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(401)
  })

  it('returns 500 when the access-token env var is missing', async () => {
    delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    const req = bearerReq('valid-token', 'my-collection')
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      message: 'Missing Environment Variables'
    })
  })

  it('revalidates /home/template-gallery/<slug> and returns 200 on success', async () => {
    const req = bearerReq('valid-token', 'my-collection')
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).toHaveBeenCalledWith(
      '/home/template-gallery/my-collection'
    )
    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ revalidated: true })
  })

  it.each([['../privacy-policy'], ['foo/bar'], [''], ['Foo'], ['foo bar']])(
    'returns 400 for malformed slug %j',
    async (badSlug) => {
      const req = bearerReq('valid-token', badSlug)
      const { res, status, json, revalidate } = mockResponse()

      await handler(req, res)

      expect(revalidate).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
    }
  )

  it('returns 400 when slug is an array (multi-value query)', async () => {
    const req = bearerReq('valid-token', ['foo', 'bar'])
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('returns 500 when revalidate throws', async () => {
    const req = bearerReq('valid-token', 'my-collection')
    const { res, status, json, revalidate } = mockResponse()
    revalidate.mockRejectedValueOnce(new Error('boom'))

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Error revalidating' })
  })
})
