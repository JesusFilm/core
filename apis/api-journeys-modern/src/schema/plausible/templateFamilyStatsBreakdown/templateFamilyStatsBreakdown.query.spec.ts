import axios, { AxiosError, AxiosResponse, isAxiosError } from 'axios'

import { UserRole } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../../test/client'
import { prismaMock } from '../../../../test/prismaMock'
import { ability } from '../../../lib/auth/ability'
import { graphql } from '../../../lib/graphql/subgraphGraphql'

import { JourneyWithAcl } from './templateFamilyStatsBreakdown.query'

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
jest.mock('../../../../env', () => ({
  env: {
    get JOURNEYS_URL(): string | undefined {
      return process.env.JOURNEYS_URL
    },
    get PLAUSIBLE_URL(): string {
      return process.env.PLAUSIBLE_URL ?? 'https://plausible.example'
    },
    get PLAUSIBLE_API_KEY(): string {
      return process.env.PLAUSIBLE_API_KEY ?? 'plausible-key'
    }
  }
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
      $status: [JourneyStatus!]
    ) {
      templateFamilyStatsBreakdown(
        id: $id
        idType: $idType
        where: $where
        events: $events
        status: $status
      ) {
        journeyId
        journeyName
        teamName
        status
        journeyUrl
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
    } as unknown as UserRole)
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
    } as unknown as AxiosResponse)
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

    process.env.JOURNEYS_URL = 'https://test-journeys-url.com'

    prismaMock.journey.findUnique.mockResolvedValue(
      templateJourney as unknown as JourneyWithAcl
    )
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        status: 'published',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [], customDomains: [] },
        userJourneys: []
      }
    ] as unknown as JourneyWithAcl[])
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
      } as unknown as AxiosResponse)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/journey-1-slug',
              visitors: 20
            }
          ]
        }
      } as unknown as AxiosResponse)

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
          site_id: 'api-journeys-template-template-journey-id',
          property: 'event:props:templateKey',
          metrics: 'visitors'
        })
      })
    )

    expect(mockAxios.get).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/stats/breakdown'),
      expect.objectContaining({
        params: expect.objectContaining({
          site_id: 'api-journeys-template-template-journey-id',
          property: 'event:page',
          metrics: 'visitors'
        })
      })
    )

    const resultData = result as {
      data?: {
        templateFamilyStatsBreakdown?: Array<{
          journeyId: string
          journeyName: string
          teamName: string
          status: string
          journeyUrl: string
          stats: Array<{ event: string; visitors: number }>
        }>
      }
    }
    expect(resultData.data?.templateFamilyStatsBreakdown).toBeDefined()
    if (resultData.data?.templateFamilyStatsBreakdown) {
      expect(Array.isArray(resultData.data.templateFamilyStatsBreakdown)).toBe(
        true
      )
      const breakdown = resultData.data.templateFamilyStatsBreakdown[0]
      expect(breakdown?.journeyUrl).toBe(
        'https://test-journeys-url.com/journey-1-slug'
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
    } as unknown as JourneyWithAcl)
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

    prismaMock.journey.findUnique.mockResolvedValue(
      templateJourney as unknown as JourneyWithAcl
    )
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        status: 'published',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as unknown as JourneyWithAcl[])
    prismaMock.journeyVisitor.groupBy.mockResolvedValue([
      {
        journeyId: 'journey-1',
        _count: { journeyId: 5 }
      }
    ] as Awaited<ReturnType<typeof prismaMock.journeyVisitor.groupBy>>)

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
      } as unknown as AxiosResponse)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/journey-1-slug',
              visitors: 20
            }
          ]
        }
      } as unknown as AxiosResponse)

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

    prismaMock.journey.findUnique.mockResolvedValue(
      templateJourney as unknown as JourneyWithAcl
    )
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        status: 'published',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as unknown as JourneyWithAcl[])

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
    } as unknown as AxiosResponse)

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
    } as unknown as JourneyWithAcl)
    mockIsAxiosError.mockReturnValueOnce(true)
    mockAxios.get.mockRejectedValueOnce({
      response: { data: { error: 'Invalid property' } }
    } as unknown as AxiosError)

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

  it('filters journeys by multiple statuses', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(
      templateJourney as unknown as JourneyWithAcl
    )
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'journey-1-slug',
        title: 'Journey One',
        status: 'published',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      },
      {
        id: 'journey-2',
        slug: 'journey-2-slug',
        title: 'Journey Two',
        status: 'draft',
        teamId: 'team-1',
        team: { title: 'Team One', userTeams: [] },
        userJourneys: []
      }
    ] as unknown as JourneyWithAcl[])
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
            },
            {
              templateKey: JSON.stringify({
                journeyId: 'journey-2',
                event: 'buttonClick',
                target: null
              }),
              visitors: 5
            },
            {
              templateKey: JSON.stringify({
                journeyId: 'journey-3',
                event: 'buttonClick',
                target: null
              }),
              visitors: 3
            }
          ]
        }
      } as unknown as AxiosResponse)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/journey-1-slug',
              visitors: 20
            },
            {
              page: '/journey-2-slug',
              visitors: 15
            }
          ]
        }
      } as unknown as AxiosResponse)

    const result = await authClient({
      document: QUERY,
      variables: {
        id: 'template-journey-id',
        where: { property: 'event:goal' },
        status: ['published', 'draft']
      }
    })

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: ['journey-1', 'journey-2', 'journey-3'] },
          status: { in: ['published', 'draft'] }
        })
      })
    )

    const resultData = result as {
      data?: {
        templateFamilyStatsBreakdown?: Array<{
          journeyId: string
          status: string
        }>
      }
    }

    expect(resultData.data?.templateFamilyStatsBreakdown).toEqual([
      expect.objectContaining({
        journeyId: 'journey-1',
        status: 'published'
      }),
      expect.objectContaining({
        journeyId: 'journey-2',
        status: 'draft'
      })
    ])
  })

  it('returns URL with custom domain when available', async () => {
    const templateJourney = {
      id: 'template-journey-id',
      slug: 'template-slug',
      title: 'Template Journey',
      userJourneys: [],
      team: { userTeams: [] }
    }

    prismaMock.journey.findUnique.mockResolvedValue(
      templateJourney as unknown as JourneyWithAcl
    )
    prismaMock.journey.findMany.mockResolvedValue([
      {
        id: 'journey-1',
        slug: 'my-journey',
        title: 'Journey One',
        teamId: 'team-1',
        status: 'published',
        team: {
          title: 'Team One',
          userTeams: [],
          customDomains: [{ name: 'custom-domain.com' }]
        },
        userJourneys: []
      }
    ] as unknown as JourneyWithAcl[])
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
      } as unknown as AxiosResponse)
      .mockResolvedValueOnce({
        data: {
          results: [
            {
              page: '/my-journey',
              visitors: 20
            }
          ]
        }
      } as unknown as AxiosResponse)

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

    const resultData = result as {
      data?: {
        templateFamilyStatsBreakdown?: Array<{
          journeyId: string
          journeyName: string
          journeyUrl: string
        }>
      }
    }

    expect(resultData.data?.templateFamilyStatsBreakdown?.[0]?.journeyUrl).toBe(
      'https://custom-domain.com/my-journey'
    )
  })
})
