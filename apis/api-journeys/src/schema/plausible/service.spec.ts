import axios, { isAxiosError } from 'axios'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getJourneyStatsBreakdown } from './service'

vi.mock('axios')

const mockAxios = axios as Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as unknown as MockedFunction<
  typeof isAxiosError
>

function buildRows(
  count: number,
  startIndex = 0
): Array<Record<string, number | string | null>> {
  return Array.from({ length: count }, (_, i) => ({
    'event:props:templateKey': `key-${startIndex + i}`,
    visitors: 1
  }))
}

function mockPage(rows: Array<Record<string, number | string | null>>): void {
  mockAxios.get.mockResolvedValueOnce({ data: { results: rows } } as never)
}

describe('getJourneyStatsBreakdown', () => {
  const originalEnv = process.env

  beforeEach(() => {
    vi.clearAllMocks()
    process.env = {
      ...originalEnv,
      PLAUSIBLE_URL: 'https://plausible.example',
      PLAUSIBLE_API_KEY: 'plausible-key'
    }
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('maps the property key and camelCases remaining metrics', async () => {
    mockPage([{ goal: 'event-name', visitors: 10, events: 5 }])

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:goal',
      metrics: 'visitors,events'
    })

    expect(result).toEqual([
      { property: 'event-name', visitors: 10, events: 5 }
    ])
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://plausible.example/api/v1/stats/breakdown',
      expect.objectContaining({
        headers: { Authorization: 'Bearer plausible-key' },
        params: expect.objectContaining({
          site_id: 'api-journeys-journey-journey-id',
          property: 'event:goal',
          metrics: 'visitors,events',
          limit: 1000,
          page: 1
        })
      })
    )
  })

  it('stops after a single request when the first page is short', async () => {
    mockPage(buildRows(42))

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors'
    })

    expect(result).toHaveLength(42)
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
  })

  it('paginates through every page until a short page is returned', async () => {
    mockPage(buildRows(1000, 0))
    mockPage(buildRows(1000, 1000))
    mockPage(buildRows(3, 2000))

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors'
    })

    expect(result).toHaveLength(2003)
    expect(mockAxios.get).toHaveBeenCalledTimes(3)
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      1,
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ page: 1, limit: 1000 })
      })
    )
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      2,
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ page: 2, limit: 1000 })
      })
    )
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      3,
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ page: 3, limit: 1000 })
      })
    )
  })

  it('makes one extra request when the total is an exact multiple of the page size', async () => {
    mockPage(buildRows(1000, 0))
    mockPage([])

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors'
    })

    expect(result).toHaveLength(1000)
    expect(mockAxios.get).toHaveBeenCalledTimes(2)
  })

  it('stops at the max page cap and logs when every page stays full', async () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined)
    // Every page returns a full 1000 rows, simulating a runaway loop.
    mockAxios.get.mockResolvedValue({
      data: { results: buildRows(1000) }
    } as never)

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors'
    })

    expect(mockAxios.get).toHaveBeenCalledTimes(50)
    expect(result).toHaveLength(50000)
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      expect.stringContaining('hit max page cap'),
      expect.objectContaining({ siteId: 'api-journeys-journey-journey-id' })
    )

    consoleErrorSpy.mockRestore()
  })

  it('does not auto-paginate when the caller specifies an explicit limit', async () => {
    mockPage(buildRows(1000))

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors',
      limit: 1000
    })

    expect(result).toHaveLength(1000)
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ limit: 1000, page: 1 })
      })
    )
  })

  it('honors an explicit page without paginating further', async () => {
    mockPage(buildRows(1000, 1000))

    const result = await getJourneyStatsBreakdown('journey-id', {
      property: 'event:props:templateKey',
      metrics: 'visitors',
      page: 2
    })

    expect(result).toHaveLength(1000)
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ page: 2, limit: 1000 })
      })
    )
  })

  it('throws a BAD_USER_INPUT GraphQLError when Plausible returns an error', async () => {
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid property' } }
    } as never)

    await expect(
      getJourneyStatsBreakdown('journey-id', {
        property: 'event:goal',
        metrics: 'visitors'
      })
    ).rejects.toMatchObject({
      message: 'Invalid property',
      extensions: { code: 'BAD_USER_INPUT' }
    })
  })
})
