import axios, { isAxiosError } from 'axios'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

jest.mock('axios')
jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))
jest.mock('../../../lib/auth/ability', () => ({
  Action: {
    Update: 'update'
  },
  ability: jest.fn(),
  subject: jest.fn((_type, object) => ({ subject: _type, object }))
}))

const mockAxios = axios as jest.Mocked<typeof axios>
const mockIsAxiosError = isAxiosError as jest.MockedFunction<
  typeof isAxiosError
>
const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>
const mockAbility = ability as jest.MockedFunction<typeof ability>

describe('templateFamilyStatsBreakdown', () => {
  const originalEnv = process.env
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

  const QUERY = graphql(`
    query TemplateFamilyStatsBreakdown(
      $id: ID!
      $idType: IdType
      $where: PlausibleStatsBreakdownFilter!
      $events: [PlausibleEvent!]
    ) {
      templateFamilyStatsBreakdown(
        id: $id
        idType: $idType
        where: $where
        events: $events
      ) {
        journeyId
        journeyName
        teamName
        stats {
          event
          visitors
        }
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
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      userId: mockUser.id,
      roles: []
    } as any)
    mockAbility.mockReturnValue(true)
    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            templateKey: JSON.stringify({
              journeyId: 'journey-1',
              event: 'buttonClick',
              target: null
            }),
            visitors: 10
          }
        ]
      }
    } as any)
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns breakdown stats for a template family', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    mockAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              templateKey: JSON.stringify({
                journeyId: 'journey-1',
                event: 'buttonClick',
                target: null
              }),
              visitors: 10
            }
          ]
        }
      } as any)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/journey-1-slug',
              visitors: 20
            }
          ]
        }
      } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        idType: 'databaseId',
        where: {
          property: 'event:goal'
        }
      }
    })

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stats/breakdown'),
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'template-site',
          property: 'event:props:templateKey',
          metrics: 'visitors'
        })
      })
    )

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stats/breakdown'),
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'template-site',
          property: 'event:page',
          metrics: 'visitors'
        })
      })
    )

    const resultData = result as {
      data?: { templateFamilyStatsBreakdown?: unknown[] }
    }
    expect(resultData.data?.templateFamilyStatsBreakdown).toBeDefined()
    if (resultData.data?.templateFamilyStatsBreakdown) {
      expect(Array.isArray(resultData.data.templateFamilyStatsBreakdown)).toBe(
        true
      )
    }
  })

  it('returns error when template journey not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'missing',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'Journey not found'
        })
      ]
    })
  })

  it('returns error when user cannot view template journey', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'template-journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockAbility.mockReturnValueOnce(false)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
        })
      ]
    })
  })

  it('includes journeyVisitors and journeyResponses when events filter is empty', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: { journeyId: 5 }
      }
    ] as any)

    mockAxios.get
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              templateKey: JSON.stringify({
                journeyId: 'journey-1',
                event: 'buttonClick',
                target: null
              }),
              visitors: 10
            }
          ]
        }
      } as any)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/journey-1-slug',
              visitors: 20
            }
          ]
        }
      } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: { property: 'event:goal' },
        events: []
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsBreakdown?: Array<{
          stats?: Array<{ event: string }>
        }>
      }
    }
    expect(resultData.data?.templateFamilyStatsBreakdown).toBeDefined()
    if (resultData.data?.templateFamilyStatsBreakdown) {
      const breakdown = resultData.data.templateFamilyStatsBreakdown[0]
      expect(breakdown?.stats).toBeDefined()
      const stats = breakdown?.stats ?? []
      const hasJourneyVisitors = stats.some(
        (stat: { event: string }) => stat.event === 'journeyVisitors'
      )
      const hasJourneyResponses = stats.some(
        (stat: { event: string }) => stat.event === 'journeyResponses'
      )
      expect(hasJourneyVisitors).toBe(true)
      expect(hasJourneyResponses).toBe(true)
    }
  })

  it('excludes journeyVisitors and journeyResponses when not in events filter', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as any)

    mockAxios.get.mockResolvedValueOnce({
      data: {
        results: [
          {
            templateKey: JSON.stringify({
              journeyId: 'journey-1',
              event: 'buttonClick',
              target: null
            }),
            visitors: 10
          }
        ]
      }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: { property: 'event:goal' },
        events: ['buttonClick']
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsBreakdown?: Array<{
          stats?: Array<{ event: string }>
        }>
      }
    }
    expect(resultData.data?.templateFamilyStatsBreakdown).toBeDefined()
    if (resultData.data?.templateFamilyStatsBreakdown) {
      const breakdown = resultData.data.templateFamilyStatsBreakdown[0]
      expect(breakdown?.stats).toBeDefined()
      const stats = breakdown?.stats ?? []
      const hasJourneyVisitors = stats.some(
        (stat: { event: string }) => stat.event === 'journeyVisitors'
      )
      const hasJourneyResponses = stats.some(
        (stat: { event: string }) => stat.event === 'journeyResponses'
      )
      expect(hasJourneyVisitors).toBe(false)
      expect(hasJourneyResponses).toBe(false)
    }
    expect(mockAxios.get).toHaveBeenCalledTimes(1)
  })

  it('returns Plausible error message on API failure', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'template-journey-id',
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid property' } }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: { property: 'event:goal' }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsBreakdown: null },
      errors: [
        expect.objectContaining({
          message: 'Invalid property'
        })
      ]
    })
  })
})
