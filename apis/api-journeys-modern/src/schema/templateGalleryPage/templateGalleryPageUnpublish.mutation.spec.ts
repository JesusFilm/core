import { Prisma } from '@core/prisma/journeys/client'
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

describe('templateGalleryPageUnpublish', () => {
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

  const TEMPLATE_GALLERY_PAGE_UNPUBLISH = graphql(`
    mutation TemplateGalleryPageUnpublish($id: ID!) {
      templateGalleryPageUnpublish(id: $id) {
        id
        status
        publishedAt
      }
    }
  `)

  beforeEach(() => {
    jest.clearAllMocks()
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
  })

  it('transitions a published page to draft and preserves publishedAt (historical record)', async () => {
    const originalPublishedAt = new Date('2026-01-15T10:00:00Z')
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'published'
    } as any)
    prismaMock.templateGalleryPage.updateMany.mockResolvedValue({
      count: 1
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      status: 'draft',
      // publishedAt deliberately NOT cleared — preserves historical record
      publishedAt: originalPublishedAt
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageUnpublish: {
          id: 'p1',
          status: 'draft',
          publishedAt: '2026-01-15T10:00:00.000Z'
        }
      }
    })
    // Atomic transition: updateMany filters on status:published.
    expect(prismaMock.templateGalleryPage.updateMany).toHaveBeenCalledWith({
      where: { id: 'p1', status: 'published' },
      data: { status: 'draft' }
    })
    // publishedAt is NOT in the update payload — verify the implementation
    // doesn't accidentally clear it.
    const updateCall = prismaMock.templateGalleryPage.updateMany.mock
      .calls[0][0] as any
    expect(updateCall.data).not.toHaveProperty('publishedAt')
  })

  it('is idempotent — when already draft, skips updateMany and returns the canonical row', async () => {
    const originalPublishedAt = new Date('2026-01-15T10:00:00Z')
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'draft'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      status: 'draft',
      publishedAt: originalPublishedAt
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageUnpublish: {
          id: 'p1',
          status: 'draft',
          publishedAt: '2026-01-15T10:00:00.000Z'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.updateMany).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
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
    expect(prismaMock.templateGalleryPage.updateMany).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER',
      status: 'published'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to unpublish template gallery page'
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.updateMany).not.toHaveBeenCalled()
  })

  it('rewraps Prisma P2025 (page deleted between fetch and re-read) as NOT_FOUND', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'published'
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
      document: TEMPLATE_GALLERY_PAGE_UNPUBLISH,
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
  })
})
