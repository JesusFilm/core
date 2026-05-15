import { type MockedFunction, vi } from 'vitest'

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

const invalidateSpy = vi
  .spyOn(cache, 'invalidate')
  .mockResolvedValue(undefined)

describe('templateGalleryPageDelete', () => {
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

  const TEMPLATE_GALLERY_PAGE_DELETE = graphql(`
    mutation TemplateGalleryPageDelete($id: ID!) {
      templateGalleryPageDelete(id: $id) {
        id
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
  })

  it('deletes a page when caller is in the team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.delete.mockResolvedValue({ id: 'p1' } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageDelete: { id: 'p1' } }
    })
    expect(prismaMock.templateGalleryPage.delete).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'p1' } })
    )
    expect(invalidateSpy).toHaveBeenCalledTimes(1)
    expect(invalidateSpy).toHaveBeenCalledWith([
      { typename: 'TemplateGalleryPage' }
    ])
    // Ordering invariant: invalidate runs AFTER prisma.delete completes
    // (delete is a single statement, no $transaction here — the delete
    // promise is the commit boundary).
    expect(
      prismaMock.templateGalleryPage.delete.mock.invocationCallOrder[0]
    ).toBeLessThan(invalidateSpy.mock.invocationCallOrder[0])
  })

  it('throws NOT_FOUND when page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
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
    expect(prismaMock.templateGalleryPage.delete).not.toHaveBeenCalled()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to delete template gallery page'
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.delete).not.toHaveBeenCalled()
    expect(invalidateSpy).not.toHaveBeenCalled()
  })
})
