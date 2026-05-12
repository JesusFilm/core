import type { NextApiRequest, NextApiResponse } from 'next'
import { getApiRequestTokens } from 'next-firebase-auth-edge'

import handler from './preview-template-gallery'

jest.mock('next-firebase-auth-edge', () => ({
  getApiRequestTokens: jest.fn()
}))

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

  beforeEach(() => {
    process.env.JOURNEYS_URL = 'https://your.nextstep.is'
    mockGetApiRequestTokens.mockReset()
    mockGetApiRequestTokens.mockResolvedValue({ token: 'firebase-token' })
  })

  afterEach(() => {
    process.env.JOURNEYS_URL = ORIGINAL_JOURNEYS_URL
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
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it.each([
    ['../foo'],
    ['foo/bar'],
    ['foo?next=evil'],
    [''],
    ['Foo'],
    ['foo bar']
  ])('returns 400 and does not redirect for malformed slug %j', async (
    badSlug
  ) => {
    const req = {
      query: { slug: badSlug }
    } as unknown as NextApiRequest
    const { res, status, json, redirect } = mockResponse()

    await handler(req, res)

    expect(redirect).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('redirects to /template-gallery/<slug> on the canonical domain', async () => {
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    await handler(req, res)

    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })
})
