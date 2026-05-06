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

describe('templateGalleryPageAssignJourney', () => {
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

  const TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY = graphql(`
    mutation TemplateGalleryPageAssignJourney($journeyId: ID!, $pageId: ID) {
      templateGalleryPageAssignJourney(journeyId: $journeyId, pageId: $pageId) {
        id
        title
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
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('assigns a journey to a collection (happy path)', async () => {
    // No existing assignment.
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: null
    } as any)
    // Empty collection — order starts at 0.
    prismaMock.templateGalleryPageTemplate.aggregate.mockResolvedValue({
      _max: { order: null }
    } as any)
    // Renumber pass after the create reads the page's rows in display
    // order — at this point only the newly inserted row exists.
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-new' }
    ] as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-A',
      title: 'Page A'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageAssignJourney: { id: 'page-A', title: 'Page A' }
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.create).toHaveBeenCalledWith({
      data: {
        templateGalleryPageId: 'page-A',
        journeyId: 'journey-1',
        order: 0
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
  })

  it('appends to the end of an existing collection (next order = max + 1)', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: null
    } as any)
    prismaMock.templateGalleryPageTemplate.aggregate.mockResolvedValue({
      _max: { order: 4 }
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-1' },
      { id: 'tpt-2' },
      { id: 'tpt-3' },
      { id: 'tpt-4' },
      { id: 'tpt-5' },
      { id: 'tpt-new' }
    ] as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-A',
      title: 'Page A'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(prismaMock.templateGalleryPageTemplate.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ order: 5 })
    })
  })

  it('reassigns from one collection to another atomically (delete old, insert new)', async () => {
    // Journey is currently in page-A (an old assignment).
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-old',
      templateGalleryPageId: 'page-A'
    } as any)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-B',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: null
    } as any)
    prismaMock.templateGalleryPageTemplate.aggregate.mockResolvedValue({
      _max: { order: 2 }
    } as any)
    // Two findMany calls during a cross-page move: first for the source
    // renumber after delete, then for the target renumber after create.
    prismaMock.templateGalleryPageTemplate.findMany
      .mockResolvedValueOnce([{ id: 'tpt-source-remaining' }] as any)
      .mockResolvedValueOnce([
        { id: 'tpt-existing-target' },
        { id: 'tpt-existing-target-2' },
        { id: 'tpt-existing-target-3' },
        { id: 'tpt-new' }
      ] as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-B',
      title: 'Page B'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-B' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageAssignJourney: { id: 'page-B', title: 'Page B' }
      }
    })
    // Old row deleted...
    expect(prismaMock.templateGalleryPageTemplate.delete).toHaveBeenCalledWith({
      where: { id: 'tpt-old' }
    })
    // ...new row appended on the target.
    expect(prismaMock.templateGalleryPageTemplate.create).toHaveBeenCalledWith({
      data: {
        templateGalleryPageId: 'page-B',
        journeyId: 'journey-1',
        order: 3
      }
    })
  })

  it('is idempotent when journey is already in the target collection', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-existing',
      templateGalleryPageId: 'page-A'
    } as any)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-A',
      title: 'Page A'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageAssignJourney: { id: 'page-A', title: 'Page A' }
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
    // Validation also skipped on the idempotent path — saves a journey lookup.
    expect(prismaMock.journey.findUnique).not.toHaveBeenCalled()
  })

  it('unassigns a journey when pageId is null and returns the source page', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-existing',
      templateGalleryPageId: 'page-A'
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-keep-1' },
      { id: 'tpt-keep-2' }
    ] as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow
      // First call: the source-page existence/team check
      .mockResolvedValueOnce({ id: 'page-A', teamId: 'team-1' } as any)
      // Second call: the canonical re-read
      .mockResolvedValueOnce({ id: 'page-A', title: 'Page A' } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: null }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageAssignJourney: { id: 'page-A', title: 'Page A' }
      }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).toHaveBeenCalledWith({
      where: { id: 'tpt-existing' }
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('renumbers a gappy [0, 2, 4, 5] source page to [0, 1, 2] after unassigning a row', async () => {
    // Reproduces Siyang's live-DB scenario: page had orders {0, 2, 4, 5}
    // after earlier assign/unassign churn. Unassigning the row at order
    // 2 must leave the remaining rows at contiguous orders 0..2 (NOT
    // 0/4/5), otherwise the next reorder's display-index protocol breaks.
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-order-2',
      templateGalleryPageId: 'page-A'
    } as any)
    prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
      { id: 'tpt-order-0' },
      { id: 'tpt-order-4' },
      { id: 'tpt-order-5' }
    ] as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow
      .mockResolvedValueOnce({ id: 'page-A', teamId: 'team-1' } as any)
      .mockResolvedValueOnce({ id: 'page-A', title: 'Page A' } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: null }
    })

    // Stage-to-negatives pass runs once for the page, then update is
    // called once per remaining row with monotonically increasing 0..N-1.
    expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
    const stageSql = (
      prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]
    ).join(' ')
    expect(stageSql).toContain('-("order") - 1000000')

    const updates = prismaMock.templateGalleryPageTemplate.update.mock.calls.map(
      (c) =>
        c[0] as { where: { id: string }; data: { order: number } }
    )
    expect(updates).toEqual([
      { where: { id: 'tpt-order-0' }, data: { order: 0 } },
      { where: { id: 'tpt-order-4' }, data: { order: 1 } },
      { where: { id: 'tpt-order-5' }, data: { order: 2 } }
    ])
  })

  it('returns null when unassigning a journey that is not in any collection (idempotent no-op)', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: null }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null }
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
  })

  it('throws BAD_USER_INPUT when journey is not a template', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: false,
      deletedAt: null
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [
        expect.objectContaining({ message: 'journey is not a template' })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('throws FORBIDDEN when journey belongs to a different team than the target page', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-OTHER',
      template: true,
      deletedAt: null
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [
        expect.objectContaining({
          message: 'journey does not belong to the target team'
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.create).not.toHaveBeenCalled()
  })

  it('throws NOT_FOUND when journey is soft-deleted', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findUnique.mockResolvedValue({
      id: 'journey-1',
      teamId: 'team-1',
      template: true,
      deletedAt: new Date('2026-04-01T00:00:00Z')
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [expect.objectContaining({ message: 'journey not found' })]
    })
  })

  it('throws NOT_FOUND when target page does not exist', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'missing-page' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found'
        })
      ]
    })
  })

  it('throws FORBIDDEN when caller is not in the target page team', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue(null)
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'page-A',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: 'page-A' }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to modify template gallery page'
        })
      ]
    })
  })

  it('throws FORBIDDEN on unassign when caller is not in the source page team', async () => {
    prismaMock.templateGalleryPageTemplate.findFirst.mockResolvedValue({
      id: 'tpt-existing',
      templateGalleryPageId: 'page-A'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValueOnce({
      id: 'page-A',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_ASSIGN_JOURNEY,
      variables: { journeyId: 'journey-1', pageId: null }
    })

    expect(result).toEqual({
      data: { templateGalleryPageAssignJourney: null },
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to modify template gallery page'
        })
      ]
    })
    expect(prismaMock.templateGalleryPageTemplate.delete).not.toHaveBeenCalled()
  })
})
