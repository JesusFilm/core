import axios from 'axios'
import { type Mocked, type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('axios')
vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockAxios = axios as Mocked<typeof axios>
const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('campaignCountryStats', () => {
  const publicClient = getClient()

  const CAMPAIGN_COUNTRY_STATS = graphql(`
    query CampaignCountryStats($slug: String!) {
      campaignCountryStats(slug: $slug) {
        totalVisitors
        totalPageviews
        countries {
          countryCode
          countryName
          visitors
          pageviews
        }
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockAxios.get.mockReset()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  it('aggregates the published share journeys of a published campaign for an anonymous visitor', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      statsFrom: new Date('2026-06-01T00:00:00Z'),
      journeys: [
        { journeyId: 'j1', journey: { teamId: 'team-1', template: false } },
        // Transferred to another team → excluded from the filter.
        { journeyId: 'j2', journey: { teamId: 'team-2', template: false } }
      ]
    } as any)
    mockAxios.get.mockResolvedValueOnce({
      data: { results: [{ country: 'BR', visitors: 3, pageviews: 7 }] }
    })

    const result = await publicClient({
      document: CAMPAIGN_COUNTRY_STATS,
      variables: { slug: 'world-cup' }
    })

    expect(result).toEqual({
      data: {
        campaignCountryStats: {
          totalVisitors: 3,
          totalPageviews: 7,
          countries: [
            {
              countryCode: 'BR',
              countryName: 'Brazil',
              visitors: 3,
              pageviews: 7
            }
          ]
        }
      }
    })
    expect(prismaMock.campaign.findFirst).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'world-cup', status: 'published' }
      })
    )
    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-team-team-1',
          filters: 'event:page==/j1/**'
        })
      })
    )
  })

  it('returns null for a draft or unknown slug without calling Plausible', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue(null)

    const result = await publicClient({
      document: CAMPAIGN_COUNTRY_STATS,
      variables: { slug: 'draft' }
    })

    expect(result).toEqual({ data: { campaignCountryStats: null } })
    expect(mockAxios.get).not.toHaveBeenCalled()
  })

  it('returns null for a malformed slug without touching the DB', async () => {
    const result = await publicClient({
      document: CAMPAIGN_COUNTRY_STATS,
      variables: { slug: 'Not Valid' }
    })

    expect(result).toEqual({ data: { campaignCountryStats: null } })
    expect(prismaMock.campaign.findFirst).not.toHaveBeenCalled()
    expect(mockAxios.get).not.toHaveBeenCalled()
  })

  it('returns zeros without calling Plausible when no share journey is published', async () => {
    prismaMock.campaign.findFirst.mockResolvedValue({
      id: 'c1',
      teamId: 'team-1',
      statsFrom: new Date('2026-06-01T00:00:00Z'),
      journeys: []
    } as any)

    const result = await publicClient({
      document: CAMPAIGN_COUNTRY_STATS,
      variables: { slug: 'world-cup' }
    })

    expect(result).toEqual({
      data: {
        campaignCountryStats: {
          totalVisitors: 0,
          totalPageviews: 0,
          countries: []
        }
      }
    })
    expect(mockAxios.get).not.toHaveBeenCalled()
  })
})
