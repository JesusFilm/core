import { ExecutionResult } from 'graphql'

import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

jest.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: jest.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as jest.MockedFunction<
  typeof getUserFromPayload
>

describe('adminJourneys', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: []
  }
  const mockPublisherUser = { ...mockUser, roles: ['publisher'] }

  const authClient = getClient({
    headers: { authorization: 'token' },
    context: { currentUser: mockUser }
  })

  const ADMIN_JOURNEYS_QUERY = graphql(`
    query AdminJourneys(
      $status: [JourneyStatus!]
      $template: Boolean
      $teamId: ID
      $useLastActiveTeamId: Boolean
    ) {
      adminJourneys(
        status: $status
        template: $template
        teamId: $teamId
        useLastActiveTeamId: $useLastActiveTeamId
      ) {
        id
        title
        status
        template
      }
    }
  `)

  const mockJourney = {
    id: 'journeyId',
    title: 'Test Journey',
    description: null,
    slug: 'test-journey',
    languageId: '529',
    themeMode: 'dark',
    themeName: 'base',
    status: 'published',
    template: false,
    teamId: 'teamId',
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
    journeyCustomizationDescription: null
  }

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('should return journeys for authenticated user', async () => {
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{
      adminJourneys: Array<typeof mockJourney & { status: string }>
    }>

    expect(result.data?.adminJourneys).toHaveLength(1)
    expect(result.data?.adminJourneys[0]).toMatchObject({
      id: 'journeyId',
      title: 'Test Journey',
      status: 'published',
      template: false
    })
  })

  it('should throw when useLastActiveTeamId is true and profile is not found', async () => {
    prismaMock.journeyProfile.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY,
      variables: { useLastActiveTeamId: true }
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('journey profile not found')
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })

  it('should filter by lastActiveTeamId when profile exists', async () => {
    prismaMock.journeyProfile.findUnique.mockResolvedValue({
      id: 'profileId',
      userId: 'userId',
      lastActiveTeamId: 'teamId',
      acceptedTermsAt: new Date(),
      journeyFlowBackButtonClicked: null,
      plausibleJourneyFlowViewed: null,
      plausibleDashboardViewed: null
    })
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY,
      variables: { useLastActiveTeamId: true }
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.data?.adminJourneys).toHaveLength(1)
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ teamId: 'teamId' })
          ])
        })
      })
    )
  })

  it('should filter by teamId', async () => {
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY,
      variables: { teamId: 'teamId' }
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.data?.adminJourneys).toHaveLength(1)
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ teamId: 'teamId' })
          ])
        })
      })
    )
  })

  it('should filter by template', async () => {
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await authClient({
      document: ADMIN_JOURNEYS_QUERY,
      variables: { template: true }
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.data?.adminJourneys).toHaveLength(1)
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({ template: true })
          ])
        })
      })
    )
  })

  it('should allow publishers to read templates regardless of status', async () => {
    mockGetUserFromPayload.mockReturnValue(mockPublisherUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockPublisherUser.id,
      roles: ['publisher']
    })
    const publisherClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: mockPublisherUser }
    })

    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await publisherClient({
      document: ADMIN_JOURNEYS_QUERY,
      variables: { template: true }
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.data?.adminJourneys).toHaveLength(1)
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          AND: expect.arrayContaining([
            expect.objectContaining({
              OR: expect.arrayContaining([expect.objectContaining({ template: true })])
            })
          ])
        })
      })
    )
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: ADMIN_JOURNEYS_QUERY
    })) as ExecutionResult<{ adminJourneys: (typeof mockJourney)[] }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })
})
