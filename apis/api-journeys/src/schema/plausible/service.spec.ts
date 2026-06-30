import axios, { isAxiosError } from 'axios'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getJourneyStatsBreakdown } from './service'

vi.mock('axios')

const mockAxios = axios as Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as unknown as MockedFunction<
  typeof isAxiosError
>

// Plausible returns the breakdown value under the property's last segment, e.g.
// property `event:props:templateKey` -> row field `templateKey`.
function buildRows(
  count: number,
  startIndex = 0
): Array<Record<string, number | string | null>> {
  return Array.from({ length: count }, (_, i) => ({
    templateKey: `key-${startIndex + i}`,
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
    // Reset the implementation too so a persistent mock (mockResolvedValue /
    // mockImplementation) from one test cannot leak into the next.
    mockAxios.get.mockReset()
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

  describe('default (single request)', () => {
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
            metrics: 'visitors,events'
          })
        })
      )
    })

    it('does not force a limit or page when the caller supplies none', async () => {
      mockPage(buildRows(1000))

      await getJourneyStatsBreakdown('journey-id', {
        property: 'event:props:templateKey',
        metrics: 'visitors'
      })

      expect(mockAxios.get).toHaveBeenCalledTimes(1)
      expect(mockAxios.get).not.toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 1000 })
        })
      )
    })

    it('passes through an explicit limit and page in a single request', async () => {
      mockPage(buildRows(500, 1000))

      const result = await getJourneyStatsBreakdown('journey-id', {
        property: 'event:props:templateKey',
        metrics: 'visitors',
        limit: 500,
        page: 3
      })

      expect(result).toHaveLength(500)
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ limit: 500, page: 3 })
        })
      )
    })
  })

  describe('paginate: true', () => {
    it('paginates through every page until a short page is returned', async () => {
      mockPage(buildRows(1000, 0))
      mockPage(buildRows(1000, 1000))
      mockPage(buildRows(3, 2000))

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

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
        3,
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({ page: 3, limit: 1000 })
        })
      )
    })

    it('stops after one request when the first page is short', async () => {
      mockPage(buildRows(42))

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

      expect(result).toHaveLength(42)
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
    })

    it('returns an empty array when the first page is empty', async () => {
      mockPage([])

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

      expect(result).toEqual([])
      expect(mockAxios.get).toHaveBeenCalledTimes(1)
    })

    it('makes one extra request when the total is an exact multiple of the page size', async () => {
      mockPage(buildRows(1000, 0))
      mockPage([])

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

      expect(result).toHaveLength(1000)
      expect(mockAxios.get).toHaveBeenCalledTimes(2)
    })

    it('de-dupes repeated rows and stops when a page adds nothing new', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      // Every page returns the SAME 1000 rows — e.g. an upstream that ignores
      // the page param. Without de-duping this would 50x-inflate the counts.
      mockAxios.get.mockResolvedValue({
        data: { results: buildRows(1000) }
      } as never)

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

      // First page fills the set; the second adds nothing new and breaks.
      expect(mockAxios.get).toHaveBeenCalledTimes(2)
      expect(result).toHaveLength(1000)
      expect(consoleErrorSpy).not.toHaveBeenCalled()

      consoleErrorSpy.mockRestore()
    })

    it('stops at the max page cap and logs when every page is full and distinct', async () => {
      const consoleErrorSpy = vi
        .spyOn(console, 'error')
        .mockImplementation(() => undefined)
      let call = 0
      // Each page returns a full page of distinct rows, so it never short-pages.
      mockAxios.get.mockImplementation(async () => {
        const rows = buildRows(1000, call * 1000)
        call += 1
        return { data: { results: rows } } as never
      })

      const result = await getJourneyStatsBreakdown(
        'journey-id',
        { property: 'event:props:templateKey', metrics: 'visitors' },
        undefined,
        { paginate: true }
      )

      expect(mockAxios.get).toHaveBeenCalledTimes(50)
      expect(result).toHaveLength(50000)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('hit max page cap'),
        expect.objectContaining({ siteId: 'api-journeys-journey-journey-id' })
      )

      consoleErrorSpy.mockRestore()
    })
  })

  describe('error handling', () => {
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

    it('rethrows the original error when it is not an axios error', async () => {
      mockIsAxiosError.mockReturnValue(false)
      mockAxios.get.mockRejectedValueOnce(new Error('boom'))

      await expect(
        getJourneyStatsBreakdown('journey-id', {
          property: 'event:goal',
          metrics: 'visitors'
        })
      ).rejects.toThrow('boom')
    })

    it('rethrows the original axios error when it carries no string error message', async () => {
      mockIsAxiosError.mockReturnValueOnce(true)
      const axiosError = { response: { data: {} } }
      mockAxios.get.mockRejectedValueOnce(axiosError as never)

      await expect(
        getJourneyStatsBreakdown('journey-id', {
          property: 'event:goal',
          metrics: 'visitors'
        })
      ).rejects.toBe(axiosError)
    })
  })
})
