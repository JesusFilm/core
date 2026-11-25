import { type MockedFunction, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

import { Journey, TemplateGalleryPage } from '@core/prisma/journeys/client'
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

describe('templateGalleryPage', () => {
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

  const TEMPLATE_GALLERY_PAGE = graphql(`
    query TemplateGalleryPage($id: ID!) {
      templateGalleryPage(id: $id) {
        id
        title
        slug
        status
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

  it('returns a page when caller is in the team', async () => {
    // First call: cheap auth fetch. Second call: full canonical re-read.
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1',
      title: 'Hello',
      slug: 'hello',
      status: 'draft'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPage: {
          id: 'p1',
          title: 'Hello',
          slug: 'hello',
          status: 'draft'
        }
      }
    })
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER',
      title: 'Other',
      slug: 'other',
      status: 'draft'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE,
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to read template gallery page',
          extensions: expect.objectContaining({ code: 'FORBIDDEN' })
        })
      ]
    })
  })

  it('returns assigned draft and published templates to a team member', async () => {
    const page = {
      ...mockDeep<TemplateGalleryPage>(),
      id: 'p1',
      teamId: 'team-1'
    }
    const journeys = [
      { id: 'draft-template', status: 'draft' as const },
      { id: 'published-template', status: 'published' as const },
      { id: 'archived-template', status: 'archived' as const }
    ].map((journey) => ({
      ...mockDeep<Journey>(),
      teamId: 'team-1',
      template: true,
      deletedAt: null,
      ...journey
    }))
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(page)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockImplementation(
      (args) => {
        const selection = args.include?.templates
        const where =
          typeof selection === 'object' ? selection.where : undefined
        const journeyWhere = where?.journey
        const status =
          journeyWhere != null && 'status' in journeyWhere
            ? journeyWhere.status
            : undefined
        // Apply the resolver's database status filter so a published-only
        // projection actually loses the saved draft, as it does in Prisma.
        const templates = journeys.filter((journey) => {
          if (typeof status === 'string') return journey.status === status
          return Array.isArray(status?.in)
            ? status.in.includes(journey.status)
            : true
        })
        return Promise.resolve({
          ...page,
          templates: templates.map((journey) => ({ journey }))
        }) as unknown as ReturnType<
          typeof prismaMock.templateGalleryPage.findUniqueOrThrow
        >
      }
    )

    const result = await authClient({
      document: graphql(`
        query TemplateGalleryPageAssignedTemplates($id: ID!) {
          templateGalleryPage(id: $id) {
            templates {
              id
            }
          }
        }
      `),
      variables: { id: 'p1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPage: {
          templates: [{ id: 'draft-template' }, { id: 'published-template' }]
        }
      }
    })
    expect(
      prismaMock.templateGalleryPage.findUniqueOrThrow
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          templates: expect.objectContaining({
            where: {
              journey: {
                template: true,
                status: { in: ['draft', 'published'] },
                deletedAt: null
              }
            }
          })
        })
      })
    )
  })

  it('throws NOT_FOUND when the id does not resolve', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE,
      variables: { id: 'missing' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found',
          extensions: expect.objectContaining({ code: 'NOT_FOUND' })
        })
      ]
    })
    expect(prismaMock.userTeam.findFirst).not.toHaveBeenCalled()
  })

  it('throws Not authorized when caller is unauthenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: TEMPLATE_GALLERY_PAGE,
      variables: { id: 'p1' }
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
