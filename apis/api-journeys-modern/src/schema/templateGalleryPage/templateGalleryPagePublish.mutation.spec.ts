import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'
import { cache } from '../../yoga'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
  typeof getUserFromPayload
>

// Mutation-success path invalidates the response cache by typename. Spy
// intercepts the call without touching the real in-memory cache (which is
// inert in test mode — `useResponseCache` plugin isn't installed when
// NODE_ENV === 'test', see `yoga.ts:82`).
const invalidateSpy = vi
  .spyOn(cache, 'invalidate')
  .mockResolvedValue(undefined)

describe('templateGalleryPagePublish', () => {
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

  const TEMPLATE_GALLERY_PAGE_PUBLISH = graphql(`
    mutation TemplateGalleryPagePublish($id: ID!) {
      templateGalleryPagePublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(mockUser)
    prismaMock.userRole.findUnique.mockResolvedValue({
      id: 'userRoleId',
      userId: mockUser.id,
      roles: []
    })
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: 'team-1',
      userId: mockUser.id
    } as any)
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('transitions a draft page to published and sets publishedAt', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'draft',
      publishedAt: null
    } as any)
    prismaMock.templateGalleryPage.updateMany.mockResolvedValue({
      count: 1
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      status: 'published',
      publishedAt: new Date('2026-04-29T00:00:00Z')
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPagePublish: {
          id: 'p1',
          status: 'published',
          publishedAt: '2026-04-29T00:00:00.000Z'
        }
      }
    })
    // Atomic transition: updateMany filters on status:draft so the write is
    // a no-op for any concurrent caller that already lost the race.
    expect(prismaMock.templateGalleryPage.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: 'draft' },
      data: expect.objectContaining({
        status: 'published',
        publishedAt: expect.any(Date)
      })
    })
    // Response cache is invalidated on the success path.
    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith([
      { typename: 'TemplateGalleryPage' }
    ])
  })

  it('returns the canonical row when the publish race is lost (updateMany count=0)', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'draft',
      publishedAt: null
    } as any)
    // Race lost — another publisher already flipped status to published
    // between our findUnique and updateMany.
    prismaMock.templateGalleryPage.updateMany.mockResolvedValue({
      count: 0
    } as any)
    const winnerPublishedAt = new Date('2026-04-28T11:59:59Z')
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      status: 'published',
      publishedAt: winnerPublishedAt
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPagePublish: {
          id: 'p1',
          status: 'published',
          publishedAt: '2026-04-28T11:59:59.000Z'
        }
      }
    })
    // Race-lost: updateMany matched zero rows, so this caller did NOT
    // transition state. The winning caller (whichever replica handled it)
    // owns the invalidate; this caller skips it to avoid amplifying
    // typename-level evictions on every losing race entry.
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('is idempotent — preserves publishedAt when already published', async () => {
    const originalPublishedAt = new Date('2026-01-01T00:00:00Z')
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'published',
      publishedAt: originalPublishedAt
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      status: 'published',
      publishedAt: originalPublishedAt
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPagePublish: {
          id: 'p1',
          status: 'published',
          publishedAt: '2026-01-01T00:00:00.000Z'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.updateMany).not.toHaveBeenCalled()
    // Idempotent re-publish: no state changed, no cache eviction. Keeping
    // invalidate behind a `didMutate` gate prevents authenticated insiders
    // from spamming the mutation to flush the global response cache.
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found'
        })
      ]
    })
    // Cache must NOT be invalidated on the not-found error path.
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('rewraps Prisma P2025 (page deleted between fetch and re-read) as NOT_FOUND GraphQL error', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'draft',
      publishedAt: null
    } as any)
    prismaMock.templateGalleryPage.updateMany.mockResolvedValue({
      count: 1
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('record not found', {
        code: 'P2025',
        clientVersion: '7.0.0'
      })
    )

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found'
        })
      ]
    })
    // P2025 race-loss path is also a failure path — must NOT invalidate.
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER',
      status: 'draft',
      publishedAt: null
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_PUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to publish template gallery page'
        })
      ]
    })
    // FORBIDDEN path must NOT invalidate.
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
