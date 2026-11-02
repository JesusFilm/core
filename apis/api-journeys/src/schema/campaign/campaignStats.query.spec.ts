import axios from 'axios'
import { GraphQLError, GraphQLFormattedError } from 'graphql'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { authClient, mockUser } from '../../../test/campaignBlockSetup'
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
  statsCache: { get: vi.fn(), set: vi.fn(), deferRefresh: vi.fn() }
}))

const mockAxios = axios as Mocked<typeof axios>
const mockStatsCache = statsCache as Mocked<typeof statsCache>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

const STATS_WINDOW_FROM = '2000-01-01'

interface CountryVisitors {
  countryCode: string
  visitors: number
}

interface CampaignStatsResponse {
  data: {
    campaignStats: {
      from: string
      to: string
      all: { totalVisitors: number; countries: CountryVisitors[] }
      regions: Array<{
        regionId: string
        totalVisitors: number
        countries: CountryVisitors[]
      }>
    }
  }
  errors?: readonly GraphQLFormattedError[]
}

/** What `campaignStats` answers with when it errors: no data, the GraphQL errors. */
interface CampaignStatsFailure {
  data: null
  errors: readonly GraphQLError[]
}

describe('campaignStats', () => {
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
    mockStatsCache.deferRefresh.mockResolvedValue(undefined)
    prismaMock.journey.findMany.mockImplementation((async (args: any) =>
      (args.where.id.in as string[]).map((id) => ({ id }))) as any)
    mockAxios.get.mockImplementation(plausibleCountryRowsBySite(rowsByJourney))
  })

  it('makes one visitors-only country breakdown per distinct linked journey on its own site', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as CampaignStatsResponse

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

  it('starts every campaign, draft or published, at the all-time epoch', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue({
      ...publishedCampaign(),
      status: 'draft',
      publishedAt: null,
      createdAt: new Date('2026-09-01T12:00:00.000Z')
    })

    const result = (await authClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as CampaignStatsResponse

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStats.from).toBe('2000-01-01T00:00:00.000Z')
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          date: expect.stringMatching(/^2000-01-01,/)
        })
      })
    )
  })

  it('sums per-journey rows by region and landing, ranked by visitors', async () => {
    prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as CampaignStatsResponse

    expect(result.errors).toBeUndefined()
    const stats = result.data.campaignStats
    expect(stats.from).toBe('2000-01-01T00:00:00.000Z')
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
    const withOrphanRegion = {
      ...campaign,
      regions: campaign.regions.map((region) => ({
        ...region,
        listed: region.id !== 'afrRegionId'
      }))
    }
    prismaMock.campaign.findUnique.mockResolvedValue(withOrphanRegion)

    const result = (await publicClient({
      document: CAMPAIGN_STATS,
      variables: { id: 'campaignId' }
    })) as CampaignStatsResponse

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
    })) as CampaignStatsResponse

    expect(result.errors).toBeUndefined()
    expect(result.data.campaignStats.all).toEqual({
      totalVisitors: 0,
      countries: []
    })
    expect(mockAxios.get).not.toHaveBeenCalled()
  })

  describe('journey status', () => {
    it('counts every journey that is not trashed or deleted, drafts included', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      prismaMock.journey.findMany.mockResolvedValue([
        { id: 'enJourneyId' },
        { id: 'swJourneyId' }
      ] as any)

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            id: { in: expect.arrayContaining(['enJourneyId', 'frJourneyId']) },
            deletedAt: null,
            status: { notIn: ['trashed', 'deleted'] }
          }
        })
      )
      expect(result.errors).toBeUndefined()
      // frJourneyId is trashed: it is neither requested nor summed.
      expect(mockAxios.get).toHaveBeenCalledTimes(2)
      expect(result.data.campaignStats.regions[0].totalVisitors).toBe(17)
      expect(result.data.campaignStats.regions[1].totalVisitors).toBe(10)
      expect(result.data.campaignStats.all.totalVisitors).toBe(27)
    })
  })

  describe('concurrency', () => {
    it('never has more than five journeys in flight against Plausible', async () => {
      const journeyCount = 12
      const campaign = Array.from({ length: journeyCount }, (_, index) => index)
        .reduce(
          (factory, index) =>
            factory.withLinkedJourney('eurRegionId', String(index), {
              id: `journey${index}`,
              title: `EUR ${index}`,
              description: null
            }),
          campaignFactory().withLanguage('496').withRegion('EUR')
        )
        .published()
        .build()
      prismaMock.campaign.findUnique.mockResolvedValue(campaign)
      let inFlight = 0
      let peak = 0
      let releaseRequests: () => void = () => undefined
      const requestsReleased = new Promise<void>((resolve) => {
        releaseRequests = resolve
      })
      mockAxios.get.mockImplementation(async () => {
        inFlight++
        peak = Math.max(peak, inFlight)
        await requestsReleased
        inFlight--
        return plausibleCountryRows([['GB', 1]])
      })

      const pending = publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })
      // Every request the limiter admits parks on the promise, so the five
      // issued are all it lets through at once and the other seven wait.
      await vi.waitFor(() => expect(mockAxios.get).toHaveBeenCalled())
      await new Promise((resolve) => setImmediate(resolve))
      expect(mockAxios.get).toHaveBeenCalledTimes(5)
      releaseRequests()
      const result = (await pending) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(mockAxios.get).toHaveBeenCalledTimes(journeyCount)
      expect(peak).toBe(5)
      expect(result.data.campaignStats.all.totalVisitors).toBe(journeyCount)
    })
  })

  describe('auth', () => {
    it('serves a published campaign to an anonymous caller', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it('serves a published campaign to a caller outside the team', async () => {
      mockGetUserFromPayload.mockReturnValue({ ...mockUser, id: 'strangerId' })
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())

      const result = (await authClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

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
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(48)
    })

    it.each<
      [
        string,
        (request: {
          document: typeof CAMPAIGN_STATS
          variables: { id: string }
        }) => unknown,
        typeof mockUser | null
      ]
    >([
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
      })) as CampaignStatsFailure

      expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
      expect(mockAxios.get).not.toHaveBeenCalled()
    })

    it('answers NOT_FOUND for an unknown id', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(null)

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'missing' }
      })) as CampaignStatsFailure

      expect(result.errors[0].extensions.code).toBe('NOT_FOUND')
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
        }),
        { partial: false }
      )
    })

    it('serves a fresh hit without a Plausible request', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: true,
        backingOff: false,
        partial: false,
        sweptAt: Date.now(),
        sweep: {
          from: '2000-01-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }],
            frJourneyId: [],
            swJourneyId: []
          }
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

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

    it('serves a stale entry as it is and refreshes it in the background', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        backingOff: false,
        partial: false,
        sweptAt: Date.now() - 3600000,
        sweep: {
          from: '2000-01-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }],
            frJourneyId: [],
            swJourneyId: []
          }
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(4)
      await vi.waitFor(() => {
        expect(mockStatsCache.set).toHaveBeenCalledTimes(1)
      })
      expect(mockAxios.get).toHaveBeenCalledTimes(3)
    })

    it('keeps serving the last cached sweep and defers the next refresh when the background sweep fails', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      const cached = {
        fresh: false,
        backingOff: false,
        partial: false,
        sweptAt: Date.now() - 3600000,
        sweep: {
          from: '2000-01-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }]
          }
        }
      }
      mockStatsCache.get.mockResolvedValue(cached)
      mockAxios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.regions[0].totalVisitors).toBe(4)
      await vi.waitFor(() => {
        expect(mockStatsCache.deferRefresh).toHaveBeenCalledWith(
          'campaignId',
          cached
        )
      })
      expect(mockStatsCache.set).not.toHaveBeenCalled()
      expect(mockAxios.get).toHaveBeenCalledTimes(3)
    })

    it('serves a backing-off entry without sweeping Plausible again', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        ...{
          fresh: false,
          backingOff: false,
          partial: false,
          sweptAt: Date.now() - 3600000,
          sweep: {
            from: '2000-01-01T00:00:00.000Z',
            to: '2026-10-06T00:00:00.000Z',
            journeys: {
              enJourneyId: [{ countryCode: 'NZ', visitors: 4 }]
            }
          }
        },
        backingOff: true
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.regions[0].totalVisitors).toBe(4)
      expect(mockAxios.get).not.toHaveBeenCalled()
      expect(mockStatsCache.deferRefresh).not.toHaveBeenCalled()
    })

    it('refreshes in the background when a fresh entry is missing a linked journey', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: true,
        backingOff: false,
        partial: false,
        sweptAt: Date.now(),
        sweep: {
          from: '2000-01-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [{ countryCode: 'NZ', visitors: 4 }]
          }
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.all.totalVisitors).toBe(4)
      await vi.waitFor(() => {
        expect(mockStatsCache.set).toHaveBeenCalledTimes(1)
      })
      expect(mockAxios.get).toHaveBeenCalledTimes(3)
    })

    it('refreshes in the background when a fresh entry was swept from a different start', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: true,
        backingOff: false,
        partial: false,
        sweptAt: Date.now(),
        sweep: {
          from: '2026-09-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: { enJourneyId: [], frJourneyId: [], swJourneyId: [] }
        }
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.from).toBe('2026-09-01T00:00:00.000Z')
      await vi.waitFor(() => {
        expect(mockStatsCache.set).toHaveBeenCalledWith(
          'campaignId',
          expect.objectContaining({ from: '2000-01-01T00:00:00.000Z' }),
          { partial: false }
        )
      })
    })

    it('errors when Plausible fails and nothing is cached', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockAxios.get.mockRejectedValue(new Error('timeout of 10000ms exceeded'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsFailure

      expect(result.errors).toHaveLength(1)
      expect(result.data).toBeNull()
      expect(mockStatsCache.set).not.toHaveBeenCalled()
      expect(mockStatsCache.deferRefresh).toHaveBeenCalledWith(
        'campaignId',
        null
      )
    })

    it('fails fast on a failure marker without sweeping Plausible again', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        backingOff: true,
        partial: false,
        sweptAt: Date.now(),
        sweep: null
      })

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsFailure

      expect(result.errors).toHaveLength(1)
      expect(result.data).toBeNull()
      expect(mockAxios.get).not.toHaveBeenCalled()
      expect(mockStatsCache.set).not.toHaveBeenCalled()
      expect(mockStatsCache.deferRefresh).not.toHaveBeenCalled()
    })

    it('fails fast as unavailable without sweeping Plausible when Redis cannot be read', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockRejectedValue(new Error('ECONNREFUSED'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsFailure

      expect(result.data).toBeNull()
      expect(result.errors).toEqual([
        expect.objectContaining({
          message: 'Campaign stats are temporarily unavailable'
        })
      ])
      expect(mockAxios.get).not.toHaveBeenCalled()
      expect(mockStatsCache.set).not.toHaveBeenCalled()
      expect(mockStatsCache.deferRefresh).not.toHaveBeenCalled()
    })

    it('sweeps again once the failure marker has expired', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue(null)

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(mockAxios.get).toHaveBeenCalledTimes(3)
      expect(mockStatsCache.deferRefresh).not.toHaveBeenCalled()
    })

    it('keeps the journeys that answered when one request fails', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockAxios.get.mockImplementation((async (_url: string, config: any) => {
        if (config.params.site_id.endsWith('swJourneyId'))
          throw new Error('429')
        return await plausibleCountryRowsBySite(rowsByJourney)(_url, config)
      }) as any)

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsResponse

      expect(result.errors).toBeUndefined()
      expect(result.data.campaignStats.regions[0].totalVisitors).toBe(38)
      expect(result.data.campaignStats.regions[1].totalVisitors).toBe(21)
      expect(mockStatsCache.set).toHaveBeenCalledWith(
        'campaignId',
        expect.objectContaining({
          journeys: expect.objectContaining({ swJourneyId: [] })
        }),
        { partial: true }
      )
    })

    it('keeps the last sweep rows of a journey whose request fails', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockStatsCache.get.mockResolvedValue({
        fresh: false,
        backingOff: false,
        partial: false,
        sweptAt: Date.now() - 3600000,
        sweep: {
          from: '2000-01-01T00:00:00.000Z',
          to: '2026-10-06T00:00:00.000Z',
          journeys: {
            enJourneyId: [],
            frJourneyId: [],
            swJourneyId: [{ countryCode: 'KE', visitors: 6 }]
          }
        }
      })
      mockAxios.get.mockImplementation((async (_url: string, config: any) => {
        if (config.params.site_id.endsWith('swJourneyId'))
          throw new Error('429')
        return await plausibleCountryRowsBySite(rowsByJourney)(_url, config)
      }) as any)

      await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })

      await vi.waitFor(() => {
        expect(mockStatsCache.set).toHaveBeenCalledWith(
          'campaignId',
          expect.objectContaining({
            journeys: expect.objectContaining({
              swJourneyId: [{ countryCode: 'KE', visitors: 6 }]
            })
          }),
          { partial: true }
        )
      })
    })

    it('never caches a sweep in which every journey failed', async () => {
      prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
      mockAxios.get.mockRejectedValue(new Error('429'))

      const result = (await publicClient({
        document: CAMPAIGN_STATS,
        variables: { id: 'campaignId' }
      })) as CampaignStatsFailure

      expect(result.errors).toHaveLength(1)
      expect(mockStatsCache.set).not.toHaveBeenCalled()
    })

    it('gives up on a cold cache after the deadline while the sweep carries on', async () => {
      vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
      try {
        prismaMock.campaign.findUnique.mockResolvedValue(publishedCampaign())
        let releasePlausible: () => void = () => undefined
        const plausibleHangs = new Promise<void>((resolve) => {
          releasePlausible = resolve
        })
        mockAxios.get.mockImplementation((async (url: string, config: any) => {
          await plausibleHangs
          return await plausibleCountryRowsBySite(rowsByJourney)(url, config)
        }) as any)

        let settled = false
        const request = publicClient({
          document: CAMPAIGN_STATS,
          variables: { id: 'campaignId' }
        }).finally(() => {
          settled = true
        })
        for (let elapsed = 0; elapsed < 9000 && !settled; elapsed += 1000)
          await vi.advanceTimersByTimeAsync(1000)
        expect(settled).toBe(false)
        while (!settled) await vi.advanceTimersByTimeAsync(1000)
        const result = (await request) as CampaignStatsFailure

        expect(result.errors).toHaveLength(1)
        expect(mockStatsCache.set).not.toHaveBeenCalled()

        releasePlausible()
        await vi.waitFor(() => {
          expect(mockStatsCache.set).toHaveBeenCalledWith(
            'campaignId',
            expect.objectContaining({
              journeys: expect.objectContaining({
                enJourneyId: expect.any(Array)
              })
            }),
            { partial: false }
          )
        })
        expect(mockStatsCache.deferRefresh).not.toHaveBeenCalled()
      } finally {
        vi.useRealTimers()
      }
    })
  })
})
