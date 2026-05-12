import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'
import fetch from 'node-fetch'

import handler from './revalidate-template-gallery'

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
}

function mockResponse(): CapturedRes {
  const json = jest.fn()
  const status = jest.fn(() => ({ json }))
  const res = { status, json } as unknown as NextApiResponse
  return { res, status, json }
}

function authedPostReq(
  query: Record<string, string | undefined> = { slug: 'my-collection' }
): NextApiRequest {
  return {
    method: 'POST',
    headers: { 'x-requested-with': 'XMLHttpRequest' },
    query
  } as unknown as NextApiRequest
}

describe('revalidate-template-gallery', () => {
  const ORIGINAL_JOURNEYS_URL = process.env.JOURNEYS_URL
  const ORIGINAL_TOKEN = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
  let consoleError: jest.SpyInstance

  beforeEach(() => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'valid-token'
    mockFetch.mockReset()
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
    consoleError = jest.spyOn(console, 'error').mockImplementation(jest.fn())
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_JOURNEYS_URL
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ORIGINAL_TOKEN
    consoleError.mockRestore()
  })

  it('returns 405 for GET requests (CSRF guard)', async () => {
    const req = {
      method: 'GET',
      headers: { 'x-requested-with': 'XMLHttpRequest' },
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(405)
    expect(json).toHaveBeenCalledWith({ error: 'Method not allowed' })
  })

  it('returns 403 when X-Requested-With header is missing', async () => {
    const req = {
      method: 'POST',
      headers: {},
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Forbidden' })
  })

  it('returns 500 when JOURNEYS_URL env var is missing', async () => {
    delete process.env.JOURNEYS_URL
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 500 when JOURNEYS_REVALIDATE_ACCESS_TOKEN env var is missing', async () => {
    delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 403 when getApiRequestTokens resolves null', async () => {
    mockGetApiRequestTokens.mockResolvedValueOnce(null)
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('returns 403 when getApiRequestTokens throws', async () => {
    mockGetApiRequestTokens.mockRejectedValueOnce(new Error('boom'))
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it.each([
    ['../privacy-policy'],
    ['foo/bar'],
    [''],
    ['Foo'],
    ['foo bar']
  ])('returns 400 for malformed slug %j', async (badSlug) => {
    const { res, status, json } = mockResponse()

    await handler(authedPostReq({ slug: badSlug }), res)

    expect(mockFetch).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('returns 400 when slug is omitted entirely', async () => {
    const { res, status, json } = mockResponse()

    await handler(authedPostReq({}), res)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('returns 200 after revalidating the upstream slug', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as never)
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const fetchUrl = mockFetch.mock.calls[0][0] as string
    expect(fetchUrl).toContain(
      'https://your.nextstep.is/api/revalidate-template-gallery'
    )
    expect(fetchUrl).toContain('accessToken=valid-token')
    expect(fetchUrl).toContain('slug=my-collection')
    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ revalidated: true })
  })

  it('returns a generic error and logs upstream status when fetch is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => 'leaky upstream body'
    } as never)
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(502)
    expect(json).toHaveBeenCalledWith({ error: 'Error revalidating' })
    expect(consoleError).toHaveBeenCalledWith(
      'upstream revalidate failed',
      expect.objectContaining({ status: 502 })
    )
  })

  it('returns 500 when the revalidate fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'))
    const { res, status, json } = mockResponse()

    await handler(authedPostReq(), res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Error revalidating' })
  })
})
