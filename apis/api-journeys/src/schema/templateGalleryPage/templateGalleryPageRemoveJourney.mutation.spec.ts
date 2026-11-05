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

describe('templateGalleryPageRemoveJourney', () => {
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

  const TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY = graphql(`
    mutation TemplateGalleryPageRemoveJourney($journeyId: ID!, $pageId: ID) {
      templateGalleryPageRemoveJourney(journeyId: $journeyId, pageId: $pageId) {
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
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.findMany.mockImplementation((async (
      args: any
    ) => (args.where.id.in as string[]).map((id) => ({ id }))) as any)
  })

  it('removes a link without touching any other membership', async () => {
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
      id: 'tpt-link',
      isHome: false
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([])

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageRemoveJourney: [{ id: 'page-A' }] }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).toHaveBeenCalledWith({
      where: { id: 'tpt-link' }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.findFirst
    ).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
  })

  it('promotes the oldest link when the removed membership was the home', async () => {
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
      id: 'tpt-home',
      isHome: true
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([])
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-oldest-link',
      templateGalleryPageId: 'page-B'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageRemoveJourney: [{ id: 'page-A' }, { id: 'page-B' }]
      }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.findFirst
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { journeyId: 'journey-1', isHome: false },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }]
      })
    )
    expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenCalledWith({
      where: { id: 'tpt-oldest-link' },
      data: { isHome: true }
    })
  })

  it('returns an empty list when the journey is not on the page', async () => {
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({ data: { templateGalleryPageRemoveJourney: [] } })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
  })

  it('removes the journey from every page when pageId is omitted', async () => {
    prismaMock.templateGalleryPageTemplate.findMany
      .mockResolvedValueOnce([
        { templateGalleryPage: { id: 'page-B', teamId: 'team-1' } },
        { templateGalleryPage: { id: 'page-A', teamId: 'team-1' } }
      ] as any)
      .mockResolvedValue([])

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageRemoveJourney: [{ id: 'page-A' }, { id: 'page-B' }]
      }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: {
        journeyId: 'journey-1',
        templateGalleryPageId: { in: ['page-A', 'page-B'] }
      }
    })
    // No promotion: every membership is gone.
    expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
  })

  it('returns an empty list when pageId is omitted and the journey is in no page', async () => {
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([])

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1' }
    })

    expect(result).toEqual({ data: { templateGalleryPageRemoveJourney: [] } })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when the page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
  })

  it('throws FORBIDDEN when the caller is not in the page team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when removing from all pages and one page is in another team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { templateGalleryPage: { id: 'page-X', teamId: 'team-2' } }
    ] as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_REMOVE_JOURNEY,
      variables: { journeyId: 'journey-1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
  })
})
