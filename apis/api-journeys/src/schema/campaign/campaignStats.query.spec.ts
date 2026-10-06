import axios from 'axios'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { campaignFactory } from '../../../test/campaignFactory'
import { getClient } from '../../../test/client'
import {
  plausibleCountryRows,
  plausibleCountryRowsBySite
} from '../../../test/plausibleCountryRows'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { statsCache } from './stats/statsCache'

vi.mock('axios')

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./stats/statsCache', async (importOriginal) => ({
  ...(await importOriginal<typeof import('./stats/statsCache')>()),
  statsCache: { get: vi.fn(), set: vi.fn() }
}))

const mockAxios = axios as Mocked<typeof axios>
const mockStatsCache = statsCache as Mocked<typeof statsCache>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const STATS_WINDOW_FROM = '2026-10-05'

describe('campaignStats', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })
  const publicClient = getClient()

  const CAMPAIGN_STATS = graphql(`
    query CampaignStats($id: ID!) {
      campaignStats(id: $id) {
        from
        to
        all {
          totalVisitors
          countries {
            countryCode
            visitors
          }
        }
        regions {
          regionId
          totalVisitors
          countries {
            countryCode
            visitors
          }
        }
      }
    }
  `)

  /** Europe links two journeys (en, fr); Africa links one and shares `sharedJourneyId` with Europe. */
  function publishedCampaign() {
    return campaignFactory()
      .withLanguage('496')
      .withRegion('EUR')
      .withRegion('AFR')
      .withLinkedJourney('eurRegionId', '529', {
        id: 'enJourneyId',
        title: 'EUR en',
        description: null
      })
      .withLinkedJourney('eurRegionId', '496', {
        id: 'frJourneyId',
        title: 'EUR fr',
        description: null
      })
      .withLinkedJourney('afrRegionId', '529', {
        id: 'frJourneyId',
        title: 'AFR en',
        description: null
      })
      .withLinkedJourney('afrRegionId', '496', {
        id: 'swJourneyId',
        title: 'AFR sw',
        description: null
      })
      .published()
      .build()
  }

  const rowsByJourney: Record<string, Array<[string, number]>> = {
    enJourneyId: [
      ['GB', 10],
      ['FR', 5],
      ['', 2]
    ],
    frJourneyId: [
      ['FR', 20],
      ['KE', 1]
    ],
    swJourneyId: [
      ['KE', 7],
      ['TZ', 3]
    ]
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    mockStatsCache.get.mockResolvedValue(null)
    mockStatsCache.set.mockResolvedValue(undefined)
    mockAxios.get.mockImplementation(
      plausibleCountryRowsBySite(rowsByJourney) as never
    )
  })

  it('makes one visitors-only country breakdown per distinct linked journey on its own site', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    // frJourneyId is linked by both regions but requested once.
    expect(mockAxios.get).toHaveBeenCalledTimes(3)
    for (const journeyId of ['enJourneyId', 'frJourneyId', 'swJourneyId'])
      expect(mockAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/api/v1/stats/breakdown'),
        expect.objectContaining({
          timeout: 10000,
          params: expect.objectContaining({
            site_id: `api-journeys-journey-${journeyId}`,
            property: 'visit:country',
            metrics: 'visitors',
            period: 'custom',
            date: expect.stringMatching(
              `^${STATS_WINDOW_FROM},\\d{4}-\\d{2}-\\d{2}$`
            )
          })
        })
      )
  })

  it('starts a draft campaign at its creation date', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...publishedCampaign(),
      status: 'draft',
      publishedAt: null,
      createdAt: new Date('2026-09-01T12:00:00.000Z')
    })

    const result = (await authClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStats.from).toBe('2026-09-01T12:00:00.000Z')
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          date: expect.stringMatching(/^2026-09-01,/)
        })
      })
    )
  })

  it('sums per-journey rows by region and landing, ranked by visitors', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    const stats = result.data.campaignStats
    expect(stats.from).toBe('2026-10-05T00:00:00.000Z')
    // Europe = en + fr; unknown-country visitors count in the total only.
    expect(stats.regions[0]).toEqual({
      regionId: 'eurRegionId',
      totalVisitors: 38,
      countries: [
        { countryCode: 'FR', visitors: 25 },
        { countryCode: 'GB', visitors: 10 },
        { countryCode: 'KE', visitors: 1 }
      ]
    })
    // Africa = fr + sw.
    expect(stats.regions[1]).toEqual({
      regionId: 'afrRegionId',
      totalVisitors: 31,
      countries: [
        { countryCode: 'FR', visitors: 20 },
        { countryCode: 'KE', visitors: 8 },
        { countryCode: 'TZ', visitors: 3 }
      ]
    })
    // The shared journey counts once overall, a visitor of two journeys twice.
    expect(stats.all).toEqual({
      totalVisitors: 48,
      countries: [
        { countryCode: 'FR', visitors: 25 },
        { countryCode: 'GB', visitors: 10 },
        { countryCode: 'KE', visitors: 8 },
        { countryCode: 'TZ', visitors: 3 }
      ]
    })
  })

  it('counts an orphan region and a journey from another team like any other', async () => {
    const campaign = publishedCampaign()
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...campaign,
      regions: campaign.regions.map((region) => ({
        ...region,
        listed: region.id !== 'afrRegionId'
      }))
    })

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStats.regions).toHaveLength(2)
    expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    expect(mockAxios.get).toHaveBeenCalledTimes(3)
  })

  it('reports zero for a campaign with no linked journeys without calling Plausible', async () => {
    const campaign = campaignFactory().withRegion('EUR').published().build()
    prismaMock.campaign.findUnique.mockResolvedValue(campaign)

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as any

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStats.all).toEqual({
      totalVisitors: 0,
      countries: []
    })
    expect(mockAxios.get).not.toHaveBeenCalled()
  })

  describe('auth', () => {
    it('serves a published campaign to an anonymous caller', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it('serves a published campaign to a caller outside the team', async () => {
      mockGetUserFromPayload.mockReturnValue({ ...mockUser, id: 'strangerId' })
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

      const result = (await authClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it('serves a draft to a team member', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue({
        ...publishedCampaign(),
        status: 'draft'
      })

      const result = (await authClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it.each([
      ['an anonymous caller', publicClient, null],
      [
        'a caller outside the team',
        authClient,
        { ...mockUser, id: 'strangerId' }
      ]
    ])('hides a draft from %s as NOT_FOUND', async (_name, client, user) => {
      mockGetUserFromPayload.mockReturnValue(user)
      prismaMock.campaign.findUnique.mockResolvedValue({
        ...publishedCampaign(),
        status: 'draft'
      })

      const result = (await client({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors?.[0].extensions.code).toBe('NOT_FOUND')
      expect(mockAxios.get).not.toHaveBeenCalled()
    })

    it('answers NOT_FOUND for an unknown id', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(null)

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'missing' }
      })) as any

      expect(result.errors?.[0].extensions.code).toBe('NOT_FOUND')
    })
  })

  describe('cache', () => {
    it('writes the sweep to statsCache keyed by campaign id on a miss', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

      await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })

      expect(mockStatsCache.get).toHaveBeenCalledWith('campaignId')
      expect(mockStatsCache.set).toHaveBeenCalledTimes(1)
      expect(mockStatsCache.set).toHaveBeenCalledWith(
        'campaignId',
        expect.objectContaining({
          journeys: {
            enJourneyId: [
              { countryCode: 'GB', visitors: 10 },
              { countryCode: 'FR', visitors: 5 },
              { countryCode: '', visitors: 2 }
            ],
            frJourneyId: [
              { countryCode: 'FR', visitors: 20 },
              { countryCode: 'KE', visitors: 1 }
            ],
            swJourneyId: [
              { countryCode: 'KE', visitors: 7 },
              { countryCode: 'TZ', visitors: 3 }
            ]
          }
        })
      )
    })

    it('serves a fresh hit without a Plausible request', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: true,
        sweep: {
          from: '2026-10-05T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }]
          }
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(mockAxios.get).not.toHaveBeenCalled()
      expect(mockStatsCache.set).not.toHaveBeenCalled()
      expect(result.data.campaignStats.to).toBe('2026-10-06T00:00:00.000Z')
      expect(result.data.campaignStats.regions[0]).toEqual({
        regionId: 'eurRegionId',
        totalVisitors: 4,
        countries: [{ countryCode: 'NZ', visitors: 4 }]
      })
      expect(result.data.campaignStats.regions[1].totalVisitors).toBe(0)
    })

    it('refreshes a stale entry from Plausible', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        sweep: {
          from: '2026-10-05T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {}
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(mockAxios.get).toHaveBeenCalledTimes(3)
      expect(mockStatsCache.set).toHaveBeenCalledTimes(1)
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it('serves the last cached sweep and retries in the background when Plausible fails', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        sweep: {
          from: '2026-10-05T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }]
          }
        }
      })
      mockAxios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.regions[0].totalVisitors).toBe(4)
      expect(mockStatsCache.set).not.toHaveBeenCalled()

      // The failed foreground sweep and the background refresh both ask Plausible.
      await vi.waitFor(() =>
        expect(mockAxios.get.mock.calls.length).toBeGreaterThan(3)
      )
    })

    it('refreshes in the background so the next read is fresh once Plausible recovers', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        sweep: {
          from: '2026-10-05T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {}
        }
      })
      mockAxios.get
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockRejectedValueOnce(new Error('timeout'))
        .mockImplementation(plausibleCountryRowsBySite(rowsByJourney) as never)

      await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })

      await vi.waitFor(() =>
        expect(mockStatsCache.set).toHaveBeenCalledTimes(1)
      )
    })

    it('errors when Plausible fails and nothing is cached', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockAxios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toHaveLength(1)
      expect(result.data).toBeNull()
      expect(mockStatsCache.set).not.toHaveBeenCalled()
    })

    it('never caches a partial sweep', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockAxios.get
        .mockResolvedValueOnce(plausibleCountryRows([['GB', 1]]))
        .mockRejectedValue(new Error('429'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as any

      expect(result.errors).toHaveLength(1)
      expect(mockStatsCache.set).not.toHaveBeenCalled()
    })
  })
})
