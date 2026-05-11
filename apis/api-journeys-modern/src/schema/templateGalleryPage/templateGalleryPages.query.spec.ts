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

describe('templateGalleryPages', () => {
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

  const TEMPLATE_GALLERY_PAGES = graphql(`
    query TemplateGalleryPages($teamId: ID!) {
      templateGalleryPages(teamId: $teamId) {
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
  })

  it('returns pages for the team when user is a member', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue({
      id: 'ut',
      teamId: 'team-1',
      userId: mockUser.id
    } as any)
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([
      {
        id: 'p1',
        title: 'Hello',
        slug: 'hello',
        status: 'draft'
      },
      {
        id: 'p2',
        title: 'World',
        slug: 'world',
        status: 'published'
      }
    ] as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPages: [
          { id: 'p1', title: 'Hello', slug: 'hello', status: 'draft' },
          { id: 'p2', title: 'World', slug: 'world', status: 'published' }
        ]
      }
    })
    expect(prismaMock.templateGalleryPage.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { teamId: 'team-1' },
        orderBy: { createdAt: 'desc' }
      })
    )
  })

  it('throws Not authorized when user is not in the team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })

  it('throws Not authorized when caller is unauthenticated', async () => {
    mockGetUserFromPayload.mockReturnValue(null)
    const unauthClient = getClient({
      headers: { authorization: 'token' },
      context: { currentUser: null }
    })

    const result = await unauthClient({
      document: TEMPLATE_GALLERY_PAGES,
      variables: { teamId: 'team-1' }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
  })
})
