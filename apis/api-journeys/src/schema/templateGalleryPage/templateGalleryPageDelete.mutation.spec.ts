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
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([])
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
  })

  it('promotes the oldest link of every home on the page before deleting', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.delete.mockResolvedValue({ id: 'p1' } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-j1-home', journeyId: 'j1', isHome: true },
      { id: 'tpt-j2-home', journeyId: 'j2', isHome: true }
    ] as any)
    // j1 has a link on p2; j2 has none.
    prismaMock.templateGalleryPageTemplate.findFirst
      .mockResolvedValueOnce({
        id: 'tpt-j1-link',
        templateGalleryPageId: 'p2'
      } as any)
      .mockResolvedValueOnce(null)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
      variables: { id: 'p1' }
    })

    expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenCalledTimes(
      1
    )
    expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpt-j1-link' },
      data: { isHome: true }
    })
    const promoteOrder =
      prismaMock.templateGalleryPageTemplate.update.mock.invocationCallOrder[0]
    const deleteOrder =
      prismaMock.templateGalleryPage.delete.mock.invocationCallOrder[0]
    expect(promoteOrder).toBeLessThan(deleteOrder)
  })

  it('rejects deletion when a home moves to another page before its lock is acquired', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as Awaited<ReturnType<typeof prismaMock.templateGalleryPage.findUnique>>)
    const home = {
      id: 'home',
      templateGalleryPageId: 'p1',
      journeyId: 'j1',
      order: 0,
      isHome: true,
      createdAt: new Date('2026-09-23')
    }
    prismaMock.templateGalleryPageTemplate.findMany
      .mockResolvedValueOnce([home])
      .mockResolvedValue([])
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      ...home,
      id: 'link',
      templateGalleryPageId: 'p2',
      isHome: false
    })
    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
      variables: { id: 'p1' }
    })
    expect(result).toMatchObject({
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'CONFLICT' })
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPage.delete).not.toHaveBeenCalled()
  })

  it('promotes a link that became home while waiting for the page locks', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as Awaited<ReturnType<typeof prismaMock.templateGalleryPage.findUnique>>)
    prismaMock.templateGalleryPage.delete.mockResolvedValue({
      id: 'p1'
    } as Awaited<ReturnType<typeof prismaMock.templateGalleryPage.delete>>)
    const row = {
      id: 'row',
      templateGalleryPageId: 'p1',
      journeyId: 'j1',
      order: 0,
      isHome: false,
      createdAt: new Date('2026-09-23')
    }
    prismaMock.templateGalleryPageTemplate.findMany
      .mockResolvedValueOnce([row])
      .mockResolvedValueOnce([{ ...row, isHome: true }])
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      ...row,
      id: 'remaining-link',
      templateGalleryPageId: 'p2'
    })
    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_DELETE,
      variables: { id: 'p1' }
    })
    expect(result).not.toHaveProperty('errors')
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: { templateGalleryPageId: 'p1', isHome: true }
    })
    expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenCalledWith({
      where: { id: 'remaining-link' },
      data: { isHome: true }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany.mock
        .invocationCallOrder[0]
    ).toBeLessThan(
      prismaMock.templateGalleryPageTemplate.update.mock.invocationCallOrder[0]
    )
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
  })
})
