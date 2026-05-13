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
      const req = {
        query: { slug: badSlug }
      } as unknown as NextApiRequest
      const { res, status, json, redirect } = mockResponse()

      await handler(req, res)

      expect(redirect).not.toHaveBeenCalled()
      expect(mockFetch).not.toHaveBeenCalled()
      expect(status).toHaveBeenCalledWith(400)
      expect(json).toHaveBeenCalledWith({ error: 'Invalid slug' })
    }
  )

  it('revalidates the upstream slug before issuing the 307 redirect', async () => {
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    await handler(req, res)

    expect(mockFetch).toHaveBeenCalledTimes(1)
    const revalidateUrl = mockFetch.mock.calls[0][0] as string
    expect(revalidateUrl).toContain(
      'https://your.nextstep.is/api/revalidate-template-gallery'
    )
    expect(revalidateUrl).toContain('accessToken=valid-token')
    expect(revalidateUrl).toContain('slug=my-collection')
    expect(redirect).toHaveBeenCalledWith(
      307,
      'https://your.nextstep.is/template-gallery/my-collection'
    )
  })

  it('awaits the revalidate fetch before redirecting', async () => {
    // Force the revalidate fetch to resolve only after a microtask gap
    // so we can assert the redirect did NOT fire while the revalidate
    // was still pending.
    let resolveFetch: (value: unknown) => void = () => {
      throw new Error('resolveFetch must be assigned synchronously')
    }
    const pending = new Promise((resolve) => {
      resolveFetch = resolve
    })
    mockFetch.mockReturnValueOnce(pending)

    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    const handlerPromise = handler(req, res)
    // Give the handler one microtask to call fetch but block thereafter.
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
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    await handler(req, res)

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
    const req = {
      query: { slug: 'my-collection' }
    } as unknown as NextApiRequest
    const { res, redirect } = mockResponse()

    await handler(req, res)

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
