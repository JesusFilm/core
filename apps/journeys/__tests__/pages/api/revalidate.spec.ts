import type { NextApiRequest, NextApiResponse } from 'next'

import handler from '../../../pages/api/revalidate'

const ACCESS_TOKEN = 'revalidate-token'

interface MockResponse {
  status: ReturnType<typeof vi.fn>
  json: ReturnType<typeof vi.fn>
  revalidate: ReturnType<typeof vi.fn>
}

function response(): MockResponse {
  const res: MockResponse = {
    status: vi.fn(),
    json: vi.fn(),
    revalidate: vi.fn().mockResolvedValue(undefined)
  }
  res.status.mockReturnValue(res)
  res.json.mockReturnValue(res)
  return res
}

async function call(query: NextApiRequest['query']): Promise<MockResponse> {
  const res = response()
  await handler(
    { query } as unknown as NextApiRequest,
    res as unknown as NextApiResponse
  )
  return res
}

describe('/api/revalidate', () => {
  const originalToken = process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN

  beforeEach(() => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = ACCESS_TOKEN
  })

  afterEach(() => {
    if (originalToken == null)
      delete process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN
    else process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = originalToken
  })

  it('revalidates an explicit page path', async () => {
    const res = await call({
      accessToken: ACCESS_TOKEN,
      path: '/home/campaign/outreach-2026/_lang/fr'
    })

    expect(res.revalidate).toHaveBeenCalledWith(
      '/home/campaign/outreach-2026/_lang/fr'
    )
    expect(res.status).toHaveBeenCalledWith(200)
    expect(res.json).toHaveBeenCalledWith({ revalidated: true })
  })

  it('revalidates a journey on its custom domain', async () => {
    const res = await call({
      accessToken: ACCESS_TOKEN,
      slug: 'my-journey',
      hostname: 'custom.example.org'
    })

    expect(res.revalidate).toHaveBeenCalledWith(
      '/custom.example.org/my-journey'
    )
    expect(res.status).toHaveBeenCalledWith(200)
  })

  it('revalidates a journey on the root domain when no hostname is given', async () => {
    const res = await call({ accessToken: ACCESS_TOKEN, slug: 'my-journey' })

    expect(res.revalidate).toHaveBeenCalledWith('/home/my-journey')
  })

  it('refuses a path that does not start with /', async () => {
    const res = await call({ accessToken: ACCESS_TOKEN, path: 'home/x' })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.revalidate).not.toHaveBeenCalled()
  })

  it('refuses a repeated path rather than joining it', async () => {
    const res = await call({ accessToken: ACCESS_TOKEN, path: ['/a', '/b'] })

    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.revalidate).not.toHaveBeenCalled()
  })

  it('refuses a bad access token', async () => {
    const res = await call({ accessToken: 'wrong', path: '/a' })

    expect(res.status).toHaveBeenCalledWith(401)
    expect(res.revalidate).not.toHaveBeenCalled()
  })
})
