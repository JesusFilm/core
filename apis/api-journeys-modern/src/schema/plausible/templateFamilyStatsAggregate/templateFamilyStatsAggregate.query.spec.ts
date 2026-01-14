import axios, { isAxiosError } from 'axios'

import { JourneyStatus } from '@core/prisma/journeys/client'
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

describe('templateFamilyStatsAggregate', () => {
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
    query TemplateFamilyStatsAggregate(
      $id: ID!
      $idType: IdType
      $where: PlausibleStatsAggregateFilter!
    ) {
      templateFamilyStatsAggregate(id: $id, idType: $idType, where: $where) {
        childJourneysCount
        totalJourneysViews
        totalJourneysResponses
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
    mockIsAxiosError.mockReturnValue(false)
  })

  afterAll(() => {
    process.env = originalEnv
  })

  it('returns aggregate stats for a template family', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      templateSite: true,
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        status: JourneyStatus.published
      },
      {
        id: 'journey-2',
        status: JourneyStatus.published
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: { journeyId: 5 }
      },
      {
        journeyId: 'journey-2',
        _count: { journeyId: 3 }
      }
    ] as any)

    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            page: '/',
            visitors: 100
          },
          {
            page: '/journey-1',
            visitors: 20
          },
          {
            page: '/journey-2',
            visitors: 15
          },
          {
            page: '/journey-1/step-1',
            visitors: 5
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
          period: '30d'
        }
      }
    })

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stats/breakdown'),
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-template-template-journey-id',
          property: 'event:page',
          metrics: 'visitors',
          period: '30d'
        })
      })
    )

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        fromTemplateId: 'template-journey-id',
        status: {
          notIn: [JourneyStatus.trashed, JourneyStatus.deleted]
        }
      },
      select: {
        id: true,
        status: true
      }
    })

    expect(prismaMock.journeyVisitor.groupBy).toHaveBeenCalledWith({
      by: ['journeyId'],
      where: {
        journeyId: { in: ['journey-1', 'journey-2'] },
        lastTextResponse: { not: null },
        journey: {
          status: {
            notIn: [JourneyStatus.trashed, JourneyStatus.deleted]
          }
        }
      },
      _count: {
        journeyId: true
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
          totalJourneysResponses: number
        }
      }
    }
    expect(resultData.data?.templateFamilyStatsAggregate).toBeDefined()
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: 2,
      totalJourneysViews: 35,
      totalJourneysResponses: 8
    })
  })

  it('filters out pages with more than one slash', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      templateSite: true,
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        status: JourneyStatus.published
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            page: '/journey-1',
            visitors: 20
          },
          {
            page: '/journey-1/step-1',
            visitors: 10
          },
          {
            page: '/journey-1/step-1/sub-step',
            visitors: 5
          }
        ]
      }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: {
          period: '30d'
        }
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
        }
      }
    }
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: 1,
      totalJourneysViews: 20,
      totalJourneysResponses: 0
    })
  })

  it('returns zero values when no child journeys exist', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    mockAxios.get.mockResolvedValue({
      data: {
        results: []
      }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: {
          period: '30d'
        }
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
          totalJourneysResponses: number
        }
      }
    }
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: 0,
      totalJourneysViews: 0,
      totalJourneysResponses: 0
    })
  })

  it('returns error when template journey not found', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'missing',
        where: {
          period: '30d'
        }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsAggregate: null },
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
        where: {
          period: '30d'
        }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsAggregate: null },
      errors: [
        expect.objectContaining({
          message: 'User is not allowed to view journey'
        })
      ]
    })
  })

  it('returns Plausible error message on API failure', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'template-journey-id',
      templateSite: true,
      userJourneys: [],
      team: { userTeams: [] }
    } as any)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid period' } }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: {
          period: 'invalid'
        }
      }
    })

    expect(result).toEqual({
      data: { templateFamilyStatsAggregate: null },
      errors: [
        expect.objectContaining({
          message: 'Invalid period'
        })
      ]
    })
  })

  it('handles pages that do not start with slash', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      templateSite: true,
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        status: JourneyStatus.published
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            page: 'journey-1',
            visitors: 20
          },
          {
            page: '/journey-1',
            visitors: 15
          }
        ]
      }
    } as any)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: {
          period: '30d'
        }
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
        }
      }
    }
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: 1,
      totalJourneysViews: 15,
      totalJourneysResponses: 0
    })
  })

  it('calculates totalJourneysResponses correctly when child journeys have responses', async () => {
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
        slug: 'journey-1-slug'
      },
      {
        id: 'journey-2',
        slug: 'journey-2-slug'
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: { journeyId: 10 }
      },
      {
        journeyId: 'journey-2',
        _count: { journeyId: 7 }
      }
    ] as any)

    mockAxios.get.mockResolvedValue({
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
        where: {
          period: '30d'
        }
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          totalJourneysResponses: number
        }
      }
    }
    expect(
      resultData.data?.templateFamilyStatsAggregate?.totalJourneysResponses
    ).toBe(17)
  })

  it('returns zero for totalJourneysResponses when no child journeys exist', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([])
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    mockAxios.get.mockResolvedValue({
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
        where: {
          period: '30d'
        }
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          totalJourneysResponses: number
        }
      }
    }
    expect(
      resultData.data?.templateFamilyStatsAggregate?.totalJourneysResponses
    ).toBe(0)
    expect(prismaMock.journeyVisitor.groupBy).not.toHaveBeenCalled()
  })

  it('should return 0 total views when plausible site hasnt been created yet', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      templateSite: false,
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug'
      }
    ] as any)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([])

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: {
          period: '30d'
        }
      }
    })

    // When templateSite is false, the Plausible API should not be called
    expect(mockAxios.get).not.toHaveBeenCalled()

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
          totalJourneysResponses: number
        }
      }
    }
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: 1,
      totalJourneysViews: 0,
      totalJourneysResponses: 0
    })
  })

  it('should exclude trashed journeys from all metrics (childJourneysCount, totalJourneysViews, totalJourneysResponses)', async () => {
    // View counts for non-trashed journeys
    const JOURNEY_1_VIEWS_MAIN = 20
    const JOURNEY_1_VIEWS_STEP = 15
    const JOURNEY_1_MAX_VIEWS = Math.max(
      JOURNEY_1_VIEWS_MAIN,
      JOURNEY_1_VIEWS_STEP
    )

    const JOURNEY_2_VIEWS_MAIN = 30
    const JOURNEY_2_VIEWS_STEP = 25
    const JOURNEY_2_MAX_VIEWS = Math.max(
      JOURNEY_2_VIEWS_MAIN,
      JOURNEY_2_VIEWS_STEP
    )

    const JOURNEY_3_VIEWS = 10

    // View counts for trashed journeys (should be excluded)
    const TRASHED_JOURNEY_1_VIEWS = 100
    const TRASHED_JOURNEY_1_STEP_VIEWS = 80
    const TRASHED_JOURNEY_2_VIEWS = 50

    // Response counts for non-trashed journeys
    const JOURNEY_1_RESPONSES = 10
    const JOURNEY_2_RESPONSES = 5
    const JOURNEY_3_RESPONSES = 3

    // Expected totals (only non-trashed journeys included)
    const EXPECTED_CHILD_JOURNEYS_COUNT = 3
    const EXPECTED_TOTAL_VIEWS =
      JOURNEY_1_MAX_VIEWS + JOURNEY_2_MAX_VIEWS + JOURNEY_3_VIEWS
    const EXPECTED_TOTAL_RESPONSES =
      JOURNEY_1_RESPONSES + JOURNEY_2_RESPONSES + JOURNEY_3_RESPONSES

    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      templateSite: true,
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(templateJourney as any)
    // Only non-trashed journeys are returned from the query
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        status: JourneyStatus.published
      },
      {
        id: 'journey-2',
        status: JourneyStatus.draft
      },
      {
        id: 'journey-3',
        status: JourneyStatus.archived
      }
    ] as any)
    // Responses only for non-trashed journeys (trashed journeys are filtered out in the query)
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: { journeyId: JOURNEY_1_RESPONSES }
      },
      {
        journeyId: 'journey-2',
        _count: { journeyId: JOURNEY_2_RESPONSES }
      },
      {
        journeyId: 'journey-3',
        _count: { journeyId: JOURNEY_3_RESPONSES }
      }
    ] as any)

    // Breakdown results include pages for both non-trashed and trashed journeys
    // Trashed journeys won't be in childJourneys, so their pages should be excluded
    mockAxios.get.mockResolvedValue({
      data: {
        results: [
          {
            page: '/journey-1',
            visitors: JOURNEY_1_VIEWS_MAIN
          },
          {
            page: '/journey-1/step-1',
            visitors: JOURNEY_1_VIEWS_STEP
          },
          {
            page: '/journey-2',
            visitors: JOURNEY_2_VIEWS_MAIN
          },
          {
            page: '/journey-2/step-1',
            visitors: JOURNEY_2_VIEWS_STEP
          },
          {
            page: '/journey-3',
            visitors: JOURNEY_3_VIEWS
          },
          {
            page: '/trashed-journey-1',
            visitors: TRASHED_JOURNEY_1_VIEWS
          },
          {
            page: '/trashed-journey-1/step-1',
            visitors: TRASHED_JOURNEY_1_STEP_VIEWS
          },
          {
            page: '/trashed-journey-2',
            visitors: TRASHED_JOURNEY_2_VIEWS
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
          period: '30d'
        }
      }
    })

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith({
      where: {
        fromTemplateId: 'template-journey-id',
        status: {
          notIn: [JourneyStatus.trashed, JourneyStatus.deleted]
        }
      },
      select: {
        id: true,
        status: true
      }
    })

    expect(prismaMock.journeyVisitor.groupBy).toHaveBeenCalledWith({
      by: ['journeyId'],
      where: {
        journeyId: { in: ['journey-1', 'journey-2', 'journey-3'] },
        lastTextResponse: { not: null },
        journey: {
          status: {
            notIn: [JourneyStatus.trashed, JourneyStatus.deleted]
          }
        }
      },
      _count: {
        journeyId: true
      }
    })

    const resultData = result as {
      data?: {
        templateFamilyStatsAggregate?: {
          childJourneysCount: number
          totalJourneysViews: number
          totalJourneysResponses: number
        }
      }
    }

    // Verify all metrics exclude trashed journeys
    expect(resultData.data?.templateFamilyStatsAggregate).toEqual({
      childJourneysCount: EXPECTED_CHILD_JOURNEYS_COUNT,
      totalJourneysViews: EXPECTED_TOTAL_VIEWS,
      totalJourneysResponses: EXPECTED_TOTAL_RESPONSES
    })
  })
})
