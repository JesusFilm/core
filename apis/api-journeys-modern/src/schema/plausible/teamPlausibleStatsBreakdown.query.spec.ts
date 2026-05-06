import axios, { isAxiosError } from 'axios'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('axios')

const mockAxios = axios as jest.Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as jest.MockedFunction<
  typeof isAxiosError
>

const ALLOWED_TEAM_ID = 'f73ae713-cf8e-446b-8cb2-45228edfd69e'

describe('teamPlausibleStatsBreakdown', () => {
  const originalEnv = process.env

  // No auth header, no currentUser — verifies the endpoint is public.
  const publicClient = getClient()

  const QUERY = graphql(`
    query TeamPlausibleStatsBreakdown(
      $teamId: ID!
      $where: PlausibleStatsBreakdownFilter!
    ) {
      teamPlausibleStatsBreakdown(teamId: $teamId, where: $where) {
        property
        visitors
        pageviews
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
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

  it('aggregates breakdown stats across every journey in an allowlisted team without authentication', async () => {
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'journey-1' },
      { id: 'journey-2' }
    ] as any)

    mockAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [
            { country: 'US', visitors: 10, pageviews: 30 },
            { country: 'CA', visitors: 4, pageviews: 6 }
          ]
        }
      } as any)
      .mockResolvedValueOnce({
        data: {
          results: [
            { country: 'US', visitors: 5, pageviews: 8 },
            { country: 'NZ', visitors: 12, pageviews: 20 }
          ]
        }
      } as any)

    const result = await publicClient({
      document: QUERY,
      variables: {
        teamId: ALLOWED_TEAM_ID,
        where: { property: 'visit:country' }
      }
    })

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: { teamId: ALLOWED_TEAM_ID },
      select: { id: true }
    })

    expect(mockAxios.get).toHaveBeenCalledTimes(2)
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      1,
      'https://plausible.example/api/v1/stats/breakdown',
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-journey-journey-1',
          property: 'visit:country',
          metrics: 'visitors,pageviews'
        })
      })
    )
    expect(mockAxios.get).toHaveBeenNthCalledWith(
      2,
      'https://plausible.example/api/v1/stats/breakdown',
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-journey-journey-2'
        })
      })
    )

    expect(result).toEqual({
      data: {
        teamPlausibleStatsBreakdown: [
          { property: 'US', visitors: 15, pageviews: 38 },
          { property: 'NZ', visitors: 12, pageviews: 20 },
          { property: 'CA', visitors: 4, pageviews: 6 }
        ]
      }
    })
  })

  it('returns FORBIDDEN when teamId is not in the allowlist', async () => {
    const result = await publicClient({
      document: QUERY,
      variables: {
        teamId: 'some-other-team',
        where: { property: 'visit:country' }
      }
    })

    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
    expect(mockAxios.get).not.toHaveBeenCalled()
    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Team is not allowed',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
  })

  it('returns an empty list and does not call Plausible when the team has no journeys', async () => {
    prismaMock.journey.findMany.mockResolvedValue([] as any)

    const result = await publicClient({
      document: QUERY,
      variables: {
        teamId: ALLOWED_TEAM_ID,
        where: { property: 'visit:country' }
      }
    })

    expect(mockAxios.get).not.toHaveBeenCalled()
    expect(result).toEqual({
      data: { teamPlausibleStatsBreakdown: [] }
    })
  })

  it('returns Plausible error message on API failure', async () => {
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'journey-1' }] as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid property' } }
    } as any)

    const result = await publicClient({
      document: QUERY,
      variables: {
        teamId: ALLOWED_TEAM_ID,
        where: { property: 'visit:country' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'Invalid property'
        })
      ]
    })
  })
})
