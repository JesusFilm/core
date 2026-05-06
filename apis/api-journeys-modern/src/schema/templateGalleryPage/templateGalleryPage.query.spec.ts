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

  it('returns a page when caller is in the team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
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
