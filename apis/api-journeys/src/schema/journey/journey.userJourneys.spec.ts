import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

describe('Journey.userJourneys', () => {
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

  const ADMIN_JOURNEYS_QUERY = graphql(`
    query AdminJourneysWithUserJourneys {
      adminJourneys {
        id
        userJourneys {
          id
          role
        }
      }
    }
  `)

  const JOURNEYS_QUERY = graphql(`
    query JourneysWithUserJourneys {
      journeys {
        id
        userJourneys {
          id
        }
      }
    }
  `)

  function journey(id: string, teamId: string) {
    return {
      id,
      title: 'Test Journey',
      description: null,
      slug: id,
      languageId: '529',
      themeMode: 'dark',
      themeName: 'base',
      status: 'published',
      template: false,
      teamId,
      createdAt: new Date(),
      updatedAt: new Date(),
      publishedAt: new Date(),
      archivedAt: null,
      trashedAt: null,
      deletedAt: null,
      featuredAt: null,
      seoTitle: null,
      seoDescription: null,
      primaryImageBlockId: null,
      creatorImageBlockId: null,
      logoImageBlockId: null,
      creatorDescription: null,
      website: false,
      showShareButton: null,
      showLikeButton: null,
      showDislikeButton: null,
      displayTitle: null,
      showHosts: null,
      showChatButtons: null,
      showReactionButtons: null,
      showLogo: null,
      showMenu: null,
      showDisplayTitle: null,
      showAssistant: null,
      menuButtonIcon: null,
      menuStepBlockId: null,
      socialNodeX: null,
      socialNodeY: null,
      strategySlug: null,
      plausibleToken: null,
      templateSite: null,
      fromTemplateId: null,
      hostId: null,
      journeyCustomizationDescription: null,
      customizable: null
    }
  }

  const journeys = [
    journey('teamJourney', 'teamId'),
    journey('ownJourney', 'otherTeamId'),
    journey('foreignJourney', 'otherTeamId')
  ]

  const userJourneys = [
    {
      id: 'teamUserJourney',
      journeyId: 'teamJourney',
      userId: 'otherUserId',
      role: 'owner',
      openedAt: null,
      updatedAt: new Date()
    },
    {
      id: 'ownUserJourney',
      journeyId: 'ownJourney',
      userId: 'userId',
      role: 'editor',
      openedAt: null,
      updatedAt: new Date()
    },
    {
      id: 'foreignUserJourney',
      journeyId: 'foreignJourney',
      userId: 'otherUserId',
      role: 'owner',
      openedAt: null,
      updatedAt: new Date()
    }
  ]

  /**
   * `journey.findMany` serves two callers: the `adminJourneys`/`journeys`
   * resolver, and the userJourneys loader's team-access lookup (which selects
   * `id` only).
   */
  function mockJourneyFindMany(teamAccessibleIds: string[]) {
    prismaMock.journey.findMany.mockImplementation((async (args: {
      select?: { id?: boolean }
    }) =>
      args?.select?.id === true
        ? teamAccessibleIds.map((id) => ({ id }))
        : journeys) as never)
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.userJourney.findMany.mockResolvedValue(userJourneys as never)
  })

  it('batches every journey in the response into a single query', async () => {
    mockJourneyFindMany(['teamJourney'])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{
      adminJourneys: Array<{ id: string; userJourneys: Array<{ id: string }> }>
    }>

    expect(result.errors).toBeUndefined()
    expect(prismaMock.userJourney.findMany).toHaveBeenCalledTimes(1)
    expect(prismaMock.userJourney.findMany).toHaveBeenCalledWith({
      where: {
        journeyId: { in: ['teamJourney', 'ownJourney', 'foreignJourney'] }
      }
    })
  })

  it('returns user journeys for a journey in a team the user belongs to', async () => {
    mockJourneyFindMany(['teamJourney'])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{
      adminJourneys: Array<{ id: string; userJourneys: Array<{ id: string }> }>
    }>

    expect(result.data?.adminJourneys[0]).toEqual({
      id: 'teamJourney',
      userJourneys: [{ id: 'teamUserJourney', role: 'owner' }]
    })
  })

  it('returns user journeys for a journey the user owns or edits', async () => {
    mockJourneyFindMany([])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{
      adminJourneys: Array<{ id: string; userJourneys: Array<{ id: string }> }>
    }>

    expect(result.data?.adminJourneys[1]).toEqual({
      id: 'ownJourney',
      userJourneys: [{ id: 'ownUserJourney', role: 'editor' }]
    })
  })

  it('returns no user journeys for a journey the user cannot access', async () => {
    mockJourneyFindMany(['teamJourney'])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{
      adminJourneys: Array<{ id: string; userJourneys: Array<{ id: string }> }>
    }>

    expect(result.data?.adminJourneys[2]).toEqual({
      id: 'foreignJourney',
      userJourneys: []
    })
  })

  it('returns no user journeys and issues no query when unauthenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    mockJourneyFindMany([])

    const result = (await publicClient({
      document: JOURNEYS_QUERY
    })) as ExecutionResult<{
      journeys: Array<{ id: string; userJourneys: Array<{ id: string }> }>
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeys.map((j) => j.userJourneys)).toEqual([
      [],
      [],
      []
    ])
    expect(prismaMock.userJourney.findMany).not.toHaveBeenCalled()
  })
})
