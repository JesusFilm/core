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

describe('adminJourney', () => {
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

  const ADMIN_JOURNEY_QUERY = graphql(`
    query AdminJourney($id: ID!, $idType: IdType) {
      adminJourney(id: $id, idType: $idType) {
        id
        title
        slug
        status
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
    journeyCustomizationDescription: null,
    customizable: null
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

  it('should return journey by slug (default idType)', async () => {
    const journeyWithAcl = {
      ...mockJourney,
      userJourneys: [{ userId: 'userId', role: 'owner' }],
      team: { id: 'teamId', userTeams: [] }
    }
    prismaMock.journey.findUnique.mockResolvedValue(journeyWithAcl as any)

    const result = (await authClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'test-journey' }
    })) as ExecutionResult<{
      adminJourney: typeof mockJourney & { status: string }
    }>

    expect(result.data?.adminJourney).toMatchObject({
      id: 'journeyId',
      title: 'Test Journey',
      slug: 'test-journey',
      status: 'published'
    })
    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { slug: 'test-journey' }
      })
    )
  })

  it('should return journey by databaseId', async () => {
    const journeyWithAcl = {
      ...mockJourney,
      userJourneys: [{ userId: 'userId', role: 'owner' }],
      team: { id: 'teamId', userTeams: [] }
    }
    prismaMock.journey.findUnique.mockResolvedValue(journeyWithAcl as any)

    const result = (await authClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'journeyId', idType: 'databaseId' as any }
    })) as ExecutionResult<{
      adminJourney: typeof mockJourney & { status: string }
    }>

    expect(result.data?.adminJourney).toMatchObject({
      id: 'journeyId',
      title: 'Test Journey'
    })
    expect(prismaMock.journey.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'journeyId' }
      })
    )
  })

  it('should throw NOT_FOUND when journey does not exist', async () => {
    prismaMock.journey.findUnique.mockResolvedValue(null)

    const result = (await authClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'nonexistent' }
    })) as ExecutionResult<{ adminJourney: typeof mockJourney }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('journey not found')
  })

  it('should throw FORBIDDEN when user has no access', async () => {
    const journeyWithAcl = {
      ...mockJourney,
      userJourneys: [],
      team: { id: 'teamId', userTeams: [] }
    }
    prismaMock.journey.findUnique.mockResolvedValue(journeyWithAcl as any)

    const result = (await authClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'test-journey' }
    })) as ExecutionResult<{ adminJourney: typeof mockJourney }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain(
      'user is not allowed to view journey'
    )
  })

  it('should reject unauthenticated users', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = (await unauthClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'test-journey' }
    })) as ExecutionResult<{ adminJourney: typeof mockJourney }>

    expect(result.errors).toBeDefined()
    expect(result.errors?.[0]?.message).toContain('Not authorized')
  })

  it('should allow team members to read journey', async () => {
    const journeyWithAcl = {
      ...mockJourney,
      userJourneys: [],
      team: {
        id: 'teamId',
        userTeams: [{ userId: 'userId', role: 'member' }]
      }
    }
    prismaMock.journey.findUnique.mockResolvedValue(journeyWithAcl as any)

    const result = (await authClient({
      document: ADMIN_JOURNEY_QUERY,
      variables: { id: 'test-journey' }
    })) as ExecutionResult<{
      adminJourney: typeof mockJourney & { status: string }
    }>

    expect(result.data?.adminJourney).toMatchObject({
      id: 'journeyId',
      title: 'Test Journey'
    })
  })
})
