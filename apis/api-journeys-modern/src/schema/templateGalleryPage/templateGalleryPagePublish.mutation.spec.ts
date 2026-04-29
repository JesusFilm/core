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

  it('transitions a draft page to published and sets publishedAt', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      status: 'draft',
      publishedAt: null
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
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
    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({
          status: 'published',
          publishedAt: expect.any(Date)
        })
      })
    )
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
    expect(prismaMock.templateGalleryPage.update).not.toHaveBeenCalled()
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
  })
})
