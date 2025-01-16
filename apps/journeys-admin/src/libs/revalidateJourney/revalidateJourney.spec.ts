import fetch, { Response } from 'node-fetch'

import { revalidateJourney } from './revalidateJourney'

jest.mock('node-fetch', () => {
  const originalModule = jest.requireActual('node-fetch')
  return {
    __esModule: true,
    ...originalModule,
    default: jest.fn()
  }
})
const mockFetch = fetch as jest.MockedFunction<typeof fetch>

describe('revalidateJourney', () => {
  const OLD_ENV = process.env

  beforeEach(() => {
    jest.resetModules()
    jest.clearAllMocks()
    process.env = { ...OLD_ENV }
  })

  afterAll(() => {
    process.env = OLD_ENV
  })

  it('should revalidate a journey', async () => {
    process.env.JOURNEYS_URL = 'www.journeys.com'
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'some-token'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => await Promise.resolve()
    } as unknown as Response)

    const res = await revalidateJourney({
      slug: 'my-cool-journey',
      hostname: 'www.domain.com'
    })
    expect(mockFetch).toHaveBeenCalledWith(
      'www.journeys.com/api/revalidate?slug=my-cool-journey&accessToken=some-token&hostname=www.domain.com'
    )
    expect(res).not.toBeNull()
  })

  it('should not revalidate on missing journey url', async () => {
    process.env.JOURNEYS_REVALIDATE_ACCESS_TOKEN = 'some-token'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => await Promise.resolve()
    } as unknown as Response)

    const res = await revalidateJourney({
      slug: 'my-cool-journey',
      hostname: 'www.domain.com'
    })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(res).toBeNull()
  })

  it('should not revalidate on missing access token', async () => {
    process.env.JOURNEYS_URL = 'www.journeys.com'

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => await Promise.resolve()
    } as unknown as Response)

    const res = await revalidateJourney({
      slug: 'my-cool-journey',
      hostname: 'www.domain.com'
    })
    expect(mockFetch).not.toHaveBeenCalled()
    expect(res).toBeNull()
  })
})
