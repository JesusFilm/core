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

describe('revalidate-template-gallery', () => {
  const ORIGINAL_TOKEN = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN

  beforeEach(() => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'valid-token'
  })

  afterEach(() => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ORIGINAL_TOKEN
    vi.clearAllMocks()
  })

  it('returns 401 when accessToken is missing', async () => {
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid access token' })
  })

  it('returns 401 when accessToken does not match the env value', async () => {
    const req = {
      query: { accessToken: 'wrong-token', slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json } = mockResponse()

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(401)
    expect(json).toHaveBeenCalledWith({ message: 'Invalid access token' })
  })

  it('revalidates /home/template-gallery/<slug> and returns 200 on success', async () => {
    const req = {
      query: { accessToken: 'valid-token', slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).toHaveBeenCalledWith(
      '/home/template-gallery/my-collection'
    )
    expect(status).toHaveBeenCalledWith(200)
    expect(json).toHaveBeenCalledWith({ revalidated: true })
  })

  it.each([
    ['../privacy-policy'],
    ['foo/bar'],
    [''],
    ['Foo'],
    ['foo bar']
  ])('returns 400 for malformed slug %j', async (badSlug) => {
    const req = {
      query: { accessToken: 'valid-token', slug: badSlug }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('returns 400 when slug is an array (multi-value query)', async () => {
    const req = {
      query: { accessToken: 'valid-token', slug: ['foo', 'bar'] }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()

    await handler(req, res)

    expect(revalidate).not.toHaveBeenCalled()
    expect(status).toHaveBeenCalledWith(400)
    expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
  })

  it('returns 500 when revalidate throws', async () => {
    const req = {
      query: { accessToken: 'valid-token', slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, status, json, revalidate } = mockResponse()
    revalidate.mockRejectedValueOnce(new Error('boom'))

    await handler(req, res)

    expect(status).toHaveBeenCalledWith(500)
    expect(json).toHaveBeenCalledWith({ error: 'Error revalidating' })
  })
})
