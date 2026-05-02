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

describe('templateGalleryPageUpdate', () => {
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

  const TEMPLATE_GALLERY_PAGE_UPDATE = graphql(`
    mutation TemplateGalleryPageUpdate(
      $id: ID!
      $input: TemplateGalleryPageUpdateInput!
    ) {
      templateGalleryPageUpdate(id: $id, input: $input) {
        id
        title
        slug
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

  it('updates a page when caller is in the team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'New Title',
      slug: 'my-welcome'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'New Title' }
      }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageUpdate: {
          id: 'p1',
          title: 'New Title',
          slug: 'my-welcome'
        }
      }
    })
    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({ title: 'New Title' })
      })
    )
  })

  it('throws NOT_FOUND when page does not exist', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'missing',
        input: { title: 'X' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'template gallery page not found'
        })
      ]
    })
  })

  it('throws FORBIDDEN when caller is not in the page team', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-OTHER'
    } as any)
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'X' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: 'user is not allowed to update template gallery page'
        })
      ]
    })
  })

  it('replaces journeyIds via deleteMany + createMany when provided', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.journey.findMany.mockResolvedValue([
      { id: 'j1' },
      { id: 'j2' }
    ] as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { journeyIds: ['j1', 'j2'] }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: { templateGalleryPageId: 'p1' }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).toHaveBeenCalledWith({
      data: [
        { templateGalleryPageId: 'p1', journeyId: 'j1', order: 0 },
        { templateGalleryPageId: 'p1', journeyId: 'j2', order: 1 }
      ]
    })
  })

  it('clears all join rows when journeyIds is an empty array', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { journeyIds: [] }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).toHaveBeenCalledWith({
      where: { templateGalleryPageId: 'p1' }
    })
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).not.toHaveBeenCalled()
  })

  it('leaves join rows alone when journeyIds is undefined', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'just title' }
      }
    })

    expect(
      prismaMock.templateGalleryPageTemplate.deleteMany
    ).not.toHaveBeenCalled()
    expect(
      prismaMock.templateGalleryPageTemplate.createMany
    ).not.toHaveBeenCalled()
  })

  it('rejects user-supplied slug when malformed', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { slug: '   ' }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('slug must contain only')
        })
      ]
    })
  })

  it('connects a new creatorImageBlock when validated', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.block.findUnique.mockResolvedValue({
      journey: { teamId: 'team-1' }
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { creatorImageBlockId: 'block-1' }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: expect.objectContaining({
          creatorImageBlock: { connect: { id: 'block-1' } }
        })
      })
    )
  })

  it('disconnects creatorImageBlock when input is explicitly null', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { creatorImageBlockId: null }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          creatorImageBlock: { disconnect: true }
        })
      })
    )
    expect(prismaMock.block.findUnique).not.toHaveBeenCalled()
  })

  it('leaves creatorImageBlock alone when input is undefined', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { title: 'just title' }
      }
    })

    const updateCall = prismaMock.templateGalleryPage.update.mock.calls[0][0]
    expect(updateCall.data).not.toHaveProperty('creatorImageBlock')
  })

  it('clears mediaUrl when input is explicitly null', async () => {
    prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
      id: 'p1',
      teamId: 'team-1'
    } as any)
    prismaMock.templateGalleryPage.update.mockResolvedValue({
      id: 'p1',
      title: 'T',
      slug: 's'
    } as any)

    await authClient({
      document: TEMPLATE_GALLERY_PAGE_UPDATE,
      variables: {
        id: 'p1',
        input: { mediaUrl: null }
      }
    })

    expect(prismaMock.templateGalleryPage.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ mediaUrl: null })
      })
    )
  })
})
