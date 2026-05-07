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

describe('preview-template-gallery', () => {
  const ORIGINAL_JOURNEYS_URL = process.env.JOURNEYS_URL
  const ORIGINAL_TOKEN = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN

  beforeEach(() => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'valid-token'
    mockFetch.mockReset()
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_JOURNEYS_URL
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ORIGINAL_TOKEN
  })

  it('returns 500 when JOURNEYS_URL env var is missing', async () => {
    delete process.env.JOURNEYS_URL
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 500 when JOURNEYS_REVALIDATE_ACCESS_TOKEN env var is missing', async () => {
    delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({
      error: 'Missing Environment Variables'
    })
  })

  it('returns 403 when getApiRequestTokens resolves null', async () => {
    mockGetApiRequestTokens.mockResolvedValueOnce(null)
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('returns 403 when getApiRequestTokens throws', async () => {
    mockGetApiRequestTokens.mockRejectedValueOnce(new Error('boom'))
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(403)
    expect(json).toHaveBeenCalledWith({ error: 'Not authorized' })
  })

  it('returns 400 when slug is missing', async () => {
    const req = { query: {} } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Missing Slug' })
  })

  it('redirects to /template-gallery/<slug> on the canonical domain after revalidating', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true } as never)
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    await handler(req, res)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const fetchUrl = mockFetch.mock.calls[0][0] as string
    expect(fetchUrl).toContain('/api/revalidate-template-gallery')
    expect(fetchUrl).toContain('accessToken=valid-token')
    expect(fetchUrl).toContain('slug=my-collection')
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  it('proxies the upstream status when the revalidate fetch is not ok', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 502,
      text: async () => 'Bad gateway'
    } as never)
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, redirect } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(502)
    expect(json).toHaveBeenCalledWith('Bad gateway')
    expect(redirect).not.toHaveBeenCalled()
  })

  it('returns 500 when the revalidate fetch throws', async () => {
    mockFetch.mockRejectedValueOnce(new Error('network down'))
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, redirect } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Error revalidating' })
    expect(redirect).not.toHaveBeenCalled()
  })
})
