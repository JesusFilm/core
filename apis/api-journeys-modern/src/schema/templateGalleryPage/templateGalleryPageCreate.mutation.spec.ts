import { Prisma } from '@core/prisma/journeys/client'
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

describe('templateGalleryPageCreate', () => {
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

  const TEMPLATE_GALLERY_PAGE_CREATE = graphql(`
    mutation TemplateGalleryPageCreate(
      $input: TemplateGalleryPageCreateInput!
    ) {
      templateGalleryPageCreate(input: $input) {
        id
        title
        slug
        status
        description
        creatorName
        mediaUrl
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
    // $transaction passthrough — runs the callback with the prisma mock as tx
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('creates a draft page with generated slug and validated journeyIds', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    prismaMock.templateGalleryPage.create.mockResolvedValue({
      id: 'p1',
      title: 'My Welcome',
      slug: 'my-welcome',
      status: 'draft',
      description: '',
      creatorName: 'Alice',
      mediaUrl: null
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'My Welcome',
          creatorName: 'Alice',
          journeyIds: ['j1', 'j2-cross-team']
        }
      }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageCreate: {
          id: 'p1',
          title: 'My Welcome',
          slug: 'my-welcome',
          status: 'draft',
          description: '',
          creatorName: 'Alice',
          mediaUrl: null
        }
      }
    })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          team: { connect: { id: 'team-1' } },
          title: 'My Welcome',
          slug: 'my-welcome',
          status: 'draft',
          creatorName: 'Alice',
          templates: {
            createMany: {
              // cross-team journey was silently dropped
              data: [{ journeyId: 'j1', order: 0 }]
            }
          }
        })
      })
    )
  })

  it('rejects mediaUrl with non-https scheme', async () => {
    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'X',
          creatorName: 'Alice',
          mediaUrl: 'http://example.com/image.png'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('https')
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.create).not.toHaveBeenCalled()
  })

  it('throws Not authorized when user is not in the team', async () => {
    prismaMock.userTeam.findFirst.mockResolvedValue(null)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-X',
          title: 'X',
          creatorName: 'Alice'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining('Not authorized')
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.create).not.toHaveBeenCalled()
  })

  it('validates creatorImageBlock ownership when provided', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.block.findUnique.mockResolvedValue({
      journey: { teamId: 'team-OTHER' }
    } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'X',
          creatorName: 'Alice',
          creatorImageBlockId: 'block-1'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [
        expect.objectContaining({
          message: expect.stringContaining(
            'creator image block does not belong'
          )
        })
      ]
    })
    expect(prismaMock.templateGalleryPage.create).not.toHaveBeenCalled()
  })

  it('retries once on P2002 (slug uniqueness race) and succeeds on second attempt', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'unique constraint failed',
      { code: 'P2002', clientVersion: '7.0.0' }
    )
    prismaMock.templateGalleryPage.create
      .mockRejectedValueOnce(p2002)
      .mockResolvedValueOnce({
        id: 'p1',
        title: 'My Welcome',
        slug: 'my-welcome-2',
        status: 'draft',
        description: '',
        creatorName: 'Alice',
        mediaUrl: null
      } as any)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'My Welcome',
          creatorName: 'Alice'
        }
      }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageCreate: {
          id: 'p1',
          title: 'My Welcome',
          slug: 'my-welcome-2',
          status: 'draft',
          description: '',
          creatorName: 'Alice',
          mediaUrl: null
        }
      }
    })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledTimes(2)
  })

  it('does NOT retry on a second P2002 (caps retries at one)', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'unique constraint failed',
      { code: 'P2002', clientVersion: '7.0.0' }
    )
    prismaMock.templateGalleryPage.create
      .mockRejectedValueOnce(p2002)
      .mockRejectedValueOnce(p2002)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'X',
          creatorName: 'Alice'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.anything()]
    })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledTimes(2)
  })

  it('does NOT retry on non-P2002 errors (lets them propagate immediately)', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    prismaMock.templateGalleryPage.create.mockRejectedValueOnce(
      new Error('disk full')
    )

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'X',
          creatorName: 'Alice'
        }
      }
    })

    expect(result).toEqual({
      data: null,
      errors: [expect.anything()]
    })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledTimes(1)
  })
})
