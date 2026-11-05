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

describe('templateGalleryPageLinkJourney', () => {
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

  const TEMPLATE_GALLERY_PAGE_LINK_JOURNEY = graphql(`
    mutation TemplateGalleryPageLinkJourney($journeyId: ID!, $pageId: ID!) {
      templateGalleryPageLinkJourney(journeyId: $journeyId, pageId: $pageId) {
        id
        title
      }
    }
  `)

  function mockTeamTemplate(): void {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: null
    } as any)
  }

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
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-A',
      title: 'Page A'
    } as any)
    // Renumber pass after the create reads the page's rows in display order.
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-new' }
    ] as any)
    prismaMock.templateGalleryPageTemplate.aggregate.mockResolvedValue({
      _max: { order: 1 }
    } as any)
  })

  it('adds the journey as its home when it has no membership yet', async () => {
    mockTeamTemplate()
    // Not on this page; no home anywhere.
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageLinkJourney: { id: 'page-A', title: 'Page A' }
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.create).toHaveBeenCalledWith({
      data: {
        templateGalleryPageId: 'page-A',
        journeyId: 'journey-1',
        order: 2,
        isHome: true
      }
    })
  })

  it('adds the journey as a link when it already has a home elsewhere', async () => {
    mockTeamTemplate()
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-home'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(prismaMock.templateGalleryPageTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ journeyId: 'journey-1', isHome: false })
    })
    // The home elsewhere is left untouched.
    expect(
      prismaMock.templateGalleryPageTemplate.update
    ).not.toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ isHome: true })
      })
    )
  })

  it('is idempotent when the journey is already on the page', async () => {
    mockTeamTemplate()
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
      id: 'tpt-existing'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageLinkJourney: { id: 'page-A', title: 'Page A' }
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('locks the journey before the page', async () => {
    mockTeamTemplate()
    prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    const lockSql = prismaMock.$queryRaw.mock.calls.map((call) =>
      (call[0] as readonly string[]).join(' ')
    )
    expect(lockSql[0]).toContain('FROM "Journey"')
    expect(lockSql[0]).toContain('FOR UPDATE')
    expect(lockSql[1]).toContain('FROM "TemplateGalleryPage"')
    const createOrder =
      prismaMock.templateGalleryPageTemplate.create.mock.invocationCallOrder[0]
    expect(prismaMock.$queryRaw.mock.invocationCallOrder[1]).toBeLessThan(
      createOrder
    )
  })

  it('throws NOT_FOUND when the page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
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
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when the caller is not in the page team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
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
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('throws BAD_USER_INPUT when the journey is not a template', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: false,
      deletedAt: null
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'BAD_USER_INPUT',
            field: 'journeyId'
          })
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when the journey belongs to another team', async () => {
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-2',
      template: true,
      deletedAt: null
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_LINK_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'FORBIDDEN',
            field: 'journeyId'
          })
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })
})
