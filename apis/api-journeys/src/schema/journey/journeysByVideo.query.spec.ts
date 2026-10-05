import { ExecutionResult } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { Role } from '@core/prisma/journeys/client'
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

describe('journeysByVideo', () => {
  const mockUser = {
    id: 'userId',
    email: 'test@example.com',
    emailVerified: true,
    firstName: 'Test',
    lastName: 'User',
    imageUrl: null,
    roles: [] as Role[]
  }
  const mockPublisherUser = { ...mockUser, roles: ['publisher'] as Role[] }

  const JOURNEYS_BY_VIDEO_QUERY = graphql(`
    query JourneysByVideo($videoId: ID!, $languageId: ID) {
      journeysByVideo(videoId: $videoId, languageId: $languageId) {
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
    slug: 'test-journey',
    status: 'published',
    languageId: '529',
    template: false,
    teamId: 'teamId',
    createdAt: new Date(),
    updatedAt: new Date(),
    publishedAt: new Date(),
    deletedAt: null
  }

  function clientFor(currentUser: typeof mockUser | null) {
    mockGetUserFromPayload.mockReturnValue(currentUser)
    if (currentUser != null)
      prismaMock.userRole.findUnique.mockResolvedValue({
        id: 'userRoleId',
        userId: currentUser.id,
        roles: currentUser.roles
      })
    return getClient({
      headers: { authorization: 'token' },
      context: { currentUser }
    })
  }

  const publisherClient = () => clientFor(mockPublisherUser)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
  })

  it('returns published non-template journeys embedding the video', async () => {
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    const result = (await publisherClient()({
      document: JOURNEYS_BY_VIDEO_QUERY,
      variables: { videoId: 'videoId' }
    })) as ExecutionResult<{
      journeysByVideo: Array<typeof mockJourney>
    }>

    expect(result.errors).toBeUndefined()
    expect(result.data?.journeysByVideo).toEqual([
      {
        id: 'journeyId',
        title: 'Test Journey',
        slug: 'test-journey',
        status: 'published'
      }
    ])
    // Asserted exactly, not with objectContaining: the two OR clauses are
    // load-bearing. Journey.template and Block.source are both nullable, and
    // the terser `template: { not: true }` / `source: 'internal'` forms drop
    // legacy rows that hold null there (verified against Postgres).
    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'published',
          deletedAt: null,
          OR: [{ template: false }, { template: null }],
          blocks: {
            some: {
              typename: 'VideoBlock',
              videoId: 'videoId',
              deletedAt: null,
              OR: [{ source: 'internal' }, { source: null }]
            }
          }
        }
      })
    )
  })

  it('orders by unique visitor count then most recently published', async () => {
    prismaMock.journey.findMany.mockResolvedValue([mockJourney as any])

    await publisherClient()({
      document: JOURNEYS_BY_VIDEO_QUERY,
      variables: { videoId: 'videoId' }
    })

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: [
          { journeyVisitors: { _count: 'desc' } },
          { publishedAt: 'desc' },
          { id: 'asc' }
        ]
      })
    )
  })

  it('narrows to a variant when languageId is provided', async () => {
    prismaMock.journey.findMany.mockResolvedValue([])

    await publisherClient()({
      document: JOURNEYS_BY_VIDEO_QUERY,
      variables: { videoId: 'videoId', languageId: '529' }
    })

    expect(prismaMock.journey.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          blocks: {
            some: expect.objectContaining({
              videoId: 'videoId',
              videoVariantLanguageId: '529'
            })
          }
        })
      })
    )
  })

  it('rejects authenticated users without the publisher role', async () => {
    const result = (await clientFor(mockUser)({
      document: JOURNEYS_BY_VIDEO_QUERY,
      variables: { videoId: 'videoId' }
    })) as ExecutionResult<{ journeysByVideo: Array<typeof mockJourney> }>

    expect(result.errors?.[0]?.message).toContain('Not authorized')
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })

  it('rejects unauthenticated users', async () => {
    const result = (await clientFor(null)({
      document: JOURNEYS_BY_VIDEO_QUERY,
      variables: { videoId: 'videoId' }
    })) as ExecutionResult<{ journeysByVideo: Array<typeof mockJourney> }>

    expect(result.errors?.[0]?.message).toContain('Not authorized')
    expect(prismaMock.journey.findMany).not.toHaveBeenCalled()
  })
})
