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
  it('should revalidate a journey', async () => {
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
      '/api/revalidate?slug=my-cool-journey&hostname=www.domain.com'
    )
    expect(res).not.toBeNull()
  })

  it('should throw error when in response is not ok', async () => {
    process.env.JOURNEYS_URL = 'www.journeys.com'
    mockFetch.mockRejectedValue({
      ok: false,
      status: 500,
      json: async () => await Promise.reject(new Error('some error'))
    } as unknown as Response)

    await expect(
      revalidateJourney({
        slug: 'my-cool-journey',
        hostname: 'www.domain.com'
      })
    ).rejects.toThrow('failed to revalidate journey')
  })
})
