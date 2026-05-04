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
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(
      draftPage as any
    )
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'page-1',
      title: 'Page 1'
    } as any)
  })

  describe('happy paths', () => {
    it('moves a template from end to start (4 → 0) in a 5-template page', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-5',
        order: 4
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j5', order: 0 }
      })

      expect(result).toEqual({
        data: {
          templateGalleryPageReorderTemplate: { id: 'page-1', title: 'Page 1' }
        }
      })
      // Stage to -1, then place at 0.
      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        1,
        { where: { id: 'tpt-5' }, data: { order: -1 } }
      )
      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        2,
        { where: { id: 'tpt-5' }, data: { order: 0 } }
      )
      // Single shift statement for the [newOrder, oldOrder) window.
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      const sql = (prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]).join(' ')
      expect(sql).toContain('+ 1')
    })

    it('moves a template from start to end (0 → 4)', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-1',
        order: 0
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: 4 }
      })

      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        1,
        { where: { id: 'tpt-1' }, data: { order: -1 } }
      )
      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        2,
        { where: { id: 'tpt-1' }, data: { order: 4 } }
      )
      expect(prismaMock.$executeRaw).toHaveBeenCalledTimes(1)
      const sql = (prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]).join(' ')
      expect(sql).toContain('- 1')
    })

    it('moves a template from middle to middle going down (1 → 3)', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-2',
        order: 1
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j2', order: 3 }
      })

      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        2,
        { where: { id: 'tpt-2' }, data: { order: 3 } }
      )
      const sql = (prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]).join(' ')
      expect(sql).toContain('- 1')
    })

    it('moves a template from middle to middle going up (3 → 1)', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-4',
        order: 3
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j4', order: 1 }
      })

      expect(prismaMock.templateGalleryPageTemplate.update).toHaveBeenNthCalledWith(
        2,
        { where: { id: 'tpt-4' }, data: { order: 1 } }
      )
      const sql = (prismaMock.$executeRaw.mock.calls[0][0] as readonly string[]).join(' ')
      expect(sql).toContain('+ 1')
    })

    it('is a no-op when oldOrder === newOrder (no writes beyond the canonical re-read)', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-2',
        order: 2
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j2', order: 2 }
      })

      expect(result).toEqual({
        data: {
          templateGalleryPageReorderTemplate: { id: 'page-1', title: 'Page 1' }
        }
      })
      expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
      expect(prismaMock.$executeRaw).not.toHaveBeenCalled()
    })
  })

  describe('validation', () => {
    it('throws BAD_USER_INPUT when order is negative', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-1',
        order: 0
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: -1 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({ message: 'order is out of range' })
        ]
      })
      expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
    })

    it('throws BAD_USER_INPUT when order >= total (would create a gap)', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue({
        id: 'tpt-1',
        order: 0
      } as any)
      prismaMock.templateGalleryPageTemplate.count.mockResolvedValue(5)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: 5 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({ message: 'order is out of range' })
        ]
      })
      expect(prismaMock.templateGalleryPageTemplate.update).not.toHaveBeenCalled()
    })

    it('throws BAD_USER_INPUT when journeyId is not a member of the page', async () => {
      prismaMock.templateGalleryPageTemplate.findUnique.mockResolvedValue(null)

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
      expect(prismaMock.templateGalleryPageTemplate.count).not.toHaveBeenCalled()
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
          expect.objectContaining({ message: 'template gallery page not found' })
        ]
      })
      expect(prismaMock.templateGalleryPageTemplate.findUnique).not.toHaveBeenCalled()
    })

    it('throws CONFLICT when the page is published', async () => {
      prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
        ...draftPage,
        status: 'published'
      } as any)

      const result = await authClient({
        document: TEMPLATE_GALLERY_PAGE_REORDER_TEMPLATE,
        variables: { pageId: 'page-1', journeyId: 'j1', order: 0 }
      })

      expect(result).toEqual({
        data: null,
        errors: [
          expect.objectContaining({
            message: 'cannot reorder templates on a published page'
          })
        ]
      })
      expect(prismaMock.templateGalleryPageTemplate.findUnique).not.toHaveBeenCalled()
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
      expect(prismaMock.templateGalleryPageTemplate.findUnique).not.toHaveBeenCalled()
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
