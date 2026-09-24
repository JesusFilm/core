import axios from 'axios'
import { type Mocked, vi } from 'vitest'

import {
  buildCampaignPageFilter,
  getCampaignCountryStats,
  resolveCountryName
} from './getCampaignCountryStats'

vi.mock('axios')

const mockAxios = axios as Mocked<typeof axios>

describe('buildCampaignPageFilter', () => {
  it('ORs a prefix wildcard per journey on event:page', () => {
    expect(buildCampaignPageFilter(['j1', 'j2'])).toBe(
      'event:page==/j1/**|/j2/**'
    )
  })
})

describe('resolveCountryName', () => {
  it('resolves known codes and returns null for unknown ones', () => {
    expect(resolveCountryName('NZ')).toBe('New Zealand')
    expect(resolveCountryName('not-a-code')).toBeNull()
  })
})

describe('getCampaignCountryStats', () => {
  const originalEnv = process.env
  const now = new Date('2026-09-24T10:00:00Z')

  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.get.mockReset()
    process.env = {
      ...originalEnv,
      PLAUSIBLE_URL: 'https://plausible.example',
      PLAUSIBLE_API_KEY: 'plausible-key'
    }
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns zeros without calling Plausible when there are no journeys', async () => {
    const statsFrom = new Date('2026-01-01T00:00:00Z')
    await expect(
      getCampaignCountryStats({
        teamId: 'team-1',
        journeyIds: [],
        statsFrom,
        now
      })
    ).resolves.toEqual({
      from: statsFrom,
      to: now,
      totalVisitors: 0,
      totalPageviews: 0,
      countries: []
    })
    expect(mockAxios.get).not.toHaveBeenCalled()
  })

  it('issues one team-site breakdown by country over the campaign window', async () => {
    mockAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          { country: 'NG', visitors: 5, pageviews: 12 },
          { country: 'KE', visitors: 9, pageviews: 20 },
          { country: '', visitors: 2, pageviews: 3 },
          { country: '??', visitors: 1, pageviews: 1 }
        ]
      }
    })

    const result = await getCampaignCountryStats({
      teamId: 'team-1',
      journeyIds: ['j1', 'j2'],
      statsFrom: new Date('2026-06-01T12:34:56Z'),
      now
    })

    expect(mockAxios.get).toHaveBeenCalledTimes(1)
    expect(mockAxios.get).toHaveBeenCalledWith(
      'https://plausible.example/api/v1/stats/breakdown',
      expect.objectContaining({
        timeout: 10000,
        params: {
          site_id: 'api-journeys-team-team-1',
          property: 'visit:country',
          metrics: 'visitors,pageviews',
          period: 'custom',
          date: '2026-06-01,2026-09-24',
          filters: 'event:page==/j1/**|/j2/**',
          limit: 300
        }
      })
    )
    // Unknown-country row is counted in totals but not listed; rows sort by
    // visitors desc; unrecognised codes keep a null name.
    expect(result.totalVisitors).toBe(17)
    expect(result.totalPageviews).toBe(36)
    expect(result.countries).toEqual([
      { countryCode: 'KE', countryName: 'Kenya', visitors: 9, pageviews: 20 },
      { countryCode: 'NG', countryName: 'Nigeria', visitors: 5, pageviews: 12 },
      { countryCode: '??', countryName: null, visitors: 1, pageviews: 1 }
    ])
  })

  it('clamps a future statsFrom to now', async () => {
    mockAxios.get.mockResolvedValueOnce({ data: { results: [] } })
    const result = await getCampaignCountryStats({
      teamId: 'team-1',
      journeyIds: ['j1'],
      statsFrom: new Date('2027-01-01T00:00:00Z'),
      now
    })
    expect(result.from).toEqual(now)
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({ date: '2026-09-24,2026-09-24' })
      })
    )
  })
})
