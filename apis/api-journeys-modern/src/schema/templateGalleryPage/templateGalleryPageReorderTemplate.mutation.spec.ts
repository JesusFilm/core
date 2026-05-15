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

describe('templateGalleryPageReorderTemplate', () => {
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

  const TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE = graphql(`
    mutation TemplateGalleryPageReorderTemplate(
      $pageId: ID!
      $journeyId: ID!
      $order: Int!
    ) {
      templateGalleryPageReorderTemplate(
        pageId: $pageId
        journeyId: $journeyId
        order: $order
      ) {
        id
        title
      }
    }
  `)

  const draftPage = {
    id: 'page-1',
    teamId: 'team-1',
    status: 'draft'
  }

  // Returns the array of `data.order` values passed to update calls in
  // the order they were invoked. With the new resolver, this is exactly
  // the contiguous 0..N-1 placement pass.
  function finalOrdersAssignedTo(rowIds: string[]): Array<number | undefined> {
    const orderById = new Map<string, number>()
    for (const call of prismaMock.templateGalleryPageTemplate.update.mock
      .calls) {
      const args = call[0] as {
        where: { id: string }
        data: { order: number }
      }
      orderById.set(args.where.id, args.data.order)
    }
    return rowIds.map((id) => orderById.get(id))
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
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(
      draftPage as any
    )
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-1',
      title: 'Page 1'
    } as any)
  })

  describe('happy paths', () => {
    it('locks the page row before reading templates', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' }
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jA', order: 1 }
      })

      // SELECT ... FOR UPDATE goes through $queryRaw and runs before the
      // existence/auth read so concurrent reorders serialize on the page.
      expect(prismaMock.$queryRaw).toHaveBeenCalled()
      const lockSql = (
        prismaMock.$queryRaw.mock.calls[0][0] as readonly string[]
      ).join(' ')
      expect(lockSql).toContain('FOR UPDATE')
    })

    it('reads templates in display order (orderBy order asc)', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' }
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jA', order: 1 }
      })

      expect(
        prismaMock.templateGalleryPageTemplate.findMany
      ).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { templateGalleryPageId: 'page-1' },
          orderBy: { order: 'asc' }
        })
      )
    })

    // Live-DB scenario: contiguous orders [0,1,2,3,4], move row at 1 to
    // newIndex 3. Expected display order after: [A,C,D,B,E] → orders
    // [A=0, C=1, D=2, B=3, E=4].
    it('contiguous, move down (1 → 3) renumbers to 0..N-1', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' },
        { id: 'tpt-C', journeyId: 'jC' },
        { id: 'tpt-D', journeyId: 'jD' },
        { id: 'tpt-E', journeyId: 'jE' }
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jB', order: 3 }
      })

      expect(
        finalOrdersAssignedTo(['tpt-A', 'tpt-C', 'tpt-D', 'tpt-B', 'tpt-E'])
      ).toEqual([0, 1, 2, 3, 4])
      // One stage-to-negatives statement covers all rows in one shot.
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      const stageSql = (
        prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]
      ).join(' ')
      expect(stageSql).toContain('-("order") - 1000000')
      // Reorder changes the cached `templates` array order — invalidate.
      expect(invalidateSpy).toHaveBeenCalledTimes(1)
      expect(invalidateSpy).toHaveBeenCalledWith([
        { typename: 'TemplateGalleryPage' }
      ])
    })

    // Live-DB scenario: contiguous orders [0,1,2,3,4], move row at 3 to
    // newIndex 1. Expected display order after: [A,D,B,C,E].
    it('contiguous, move up (3 → 1) renumbers to 0..N-1', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' },
        { id: 'tpt-C', journeyId: 'jC' },
        { id: 'tpt-D', journeyId: 'jD' },
        { id: 'tpt-E', journeyId: 'jE' }
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jD', order: 1 }
      })

      expect(
        finalOrdersAssignedTo(['tpt-A', 'tpt-D', 'tpt-B', 'tpt-C', 'tpt-E'])
      ).toEqual([0, 1, 2, 3, 4])
    })

    // Live-DB scenario: gappy orders [0,2,4,5] (4 rows in display order
    // A, B, C, D). Move B (display index 1) to display index 3. Expected
    // display order after: [A, C, D, B] → renumbered to [0, 1, 2, 3].
    // The argument arrives as the display index (3), NOT the absolute
    // order column value (5) — that's the protocol fix.
    it('gappy [0,2,4,5], gap-straddled move (display index 1 → 3) renumbers contiguously', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' }, // order 0
        { id: 'tpt-B', journeyId: 'jB' }, // order 2
        { id: 'tpt-C', journeyId: 'jC' }, // order 4
        { id: 'tpt-D', journeyId: 'jD' } // order 5
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jB', order: 3 }
      })

      expect(
        finalOrdersAssignedTo(['tpt-A', 'tpt-C', 'tpt-D', 'tpt-B'])
      ).toEqual([0, 1, 2, 3])
    })

    // Live-DB scenario: gappy [0,2,4,5], move D (display index 3) all
    // the way to display index 0. Expected: [D, A, B, C] → [0,1,2,3].
    it('gappy [0,2,4,5], all-the-way move (display index 3 → 0) renumbers contiguously', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' },
        { id: 'tpt-C', journeyId: 'jC' },
        { id: 'tpt-D', journeyId: 'jD' }
      ] as any)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jD', order: 0 }
      })

      expect(
        finalOrdersAssignedTo(['tpt-D', 'tpt-A', 'tpt-B', 'tpt-C'])
      ).toEqual([0, 1, 2, 3])
    })

    it('is a no-op when sourceIndex === newIndex (no writes beyond the canonical re-read)', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' },
        { id: 'tpt-C', journeyId: 'jC' }
      ] as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jB', order: 1 }
      })

      expect(result).toEqual({
        data: {
          templateGalleryPageReorderTemplate: { id: 'page-1', title: 'Page 1' }
        }
      })
      expect(
        prismaMock.templateGalleryPageTemplate.update
      ).not.toHaveBeenCalled()
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('throws BAD_USER_INPUT when order is negative', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' }
      ] as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jA', order: -1 }
      })

      expect(result).toEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'order is out of range' })]
      })
      expect(
        prismaMock.templateGalleryPageTemplate.update
      ).not.toHaveBeenCalled()
    })

    it('throws BAD_USER_INPUT when order >= total (would create a gap)', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' }
      ] as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jA', order: 2 }
      })

      expect(result).toEqual({
        data: null,
        errors: [expect.objectContaining({ message: 'order is out of range' })]
      })
      expect(
        prismaMock.templateGalleryPageTemplate.update
      ).not.toHaveBeenCalled()
    })

    it('throws BAD_USER_INPUT when journeyId is not a member of the page', async () => {
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' }
      ] as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j-stranger', order: 0 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'journey is not in this template gallery page'
          })
        ]
      })
      expect(
        prismaMock.templateGalleryPageTemplate.update
      ).not.toHaveBeenCalled()
    })

    it('throws NOT_FOUND when pageId does not exist', async () => {
      prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'missing', journeyId: 'j1', order: 0 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'template gallery page not found'
          })
        ]
      })
      expect(
        prismaMock.templateGalleryPageTemplate.findMany
      ).not.toHaveBeenCalled()
      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('allows reorder on a published page (no publish-state gating on the backend)', async () => {
      // Mirrors templateGalleryPageUpdate / AssignJourney — backend accepts
      // structural edits regardless of publish state. The frontend gates the
      // UX; the backend stays symmetric across these three mutations.
      prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
        ...draftPage,
        status: 'published'
      } as any)
      prismaMock.templateGalleryPageTemplate.findMany.mockResolvedValue([
        { id: 'tpt-A', journeyId: 'jA' },
        { id: 'tpt-B', journeyId: 'jB' }
      ] as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'jB', order: 0 }
      })

      expect(result).toEqual({
        data: {
          templateGalleryPageReorderTemplate: { id: 'page-1', title: 'Page 1' }
        }
      })
      expect(prismaMock.templateGalleryPageTemplate.findMany).toHaveBeenCalled()
    })
  })

  describe('auth', () => {
    it('throws FORBIDDEN when caller is not in the page team', async () => {
      prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
        ...draftPage,
        teamId: 'team-OTHER'
      } as any)
      prismaMock.userTeam.findFirst.mockResolvedValue(null)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: 0 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'user is not allowed to modify template gallery page'
          })
        ]
      })
      expect(
        prismaMock.templateGalleryPageTemplate.findMany
      ).not.toHaveBeenCalled()
      expect(invalidateSpy).not.toHaveBeenCalled()
    })

    it('throws Not authorized when caller is not authenticated', async () => {
      mockGetUserFromPayload.mockReturnValue(null)
      const publicClient = getClient()

      const result = await publicClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: 0 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: expect.stringContaining('Not authorized')
          })
        ]
      })
      expect(prismaMock.templateGalleryPage.findUnique).not.toHaveBeenCalled()
    })
  })
})
