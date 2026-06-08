import { GraphQLError } from 'graphql'
import { type MockedFunction, vi } from 'vitest'

import { Prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { getClient } from '../../../test/client'
import { prismaMock } from '../../../test/prismaMock'
import { graphql } from '../../lib/graphql/subgraphGraphql'

import { linkValidate } from './media/linkValidate'
import { muxValidate } from './media/muxValidate'

vi.mock('@core/yoga/firebaseClient', () => ({
  getUserFromPayload: vi.fn()
}))

vi.mock('./media/linkValidate', () => ({ linkValidate: vi.fn() }))
vi.mock('./media/muxValidate', () => ({ muxValidate: vi.fn() }))

const mockLinkValidate = linkValidate as MockedFunction<typeof linkValidate>
const mockMuxValidate = muxValidate as MockedFunction<typeof muxValidate>

const mockGetUserFromPayload = getUserFromPayload as MockedFunction<
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
        creatorImageSrc
        creatorImageAlt
        mediaUrl
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
    // $transaction passthrough — runs the callback with the prisma mock as tx
    prismaMock.$transaction.mockImplementation(
      async (callback: any) => await callback(prismaMock)
    )
  })

  it('creates a draft page with generated slug and validated journeyIds', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([{ id: 'j1' }] as any)
    const page = {
      id: 'p1',
      title: 'My Welcome',
      slug: 'my-welcome',
      status: 'draft',
      description: '',
      creatorName: 'Alice',
      creatorImageSrc: null,
      creatorImageAlt: null,
      mediaUrl: null
    }
    prismaMock.templateGalleryPage.create.mockResolvedValue(page as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue(
      page as any
    )

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
          creatorImageSrc: null,
          creatorImageAlt: null,
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

  it('persists creatorImageSrc and creatorImageAlt as plain scalars', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    const page = {
      id: 'p1',
      title: 'My Welcome',
      slug: 'my-welcome',
      status: 'draft',
      description: '',
      creatorName: 'Alice',
      creatorImageSrc: 'https://images.example.com/alice.jpg',
      creatorImageAlt: 'Alice headshot',
      mediaUrl: null
    }
    prismaMock.templateGalleryPage.create.mockResolvedValue(page as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue(
      page as any
    )

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'My Welcome',
          creatorName: 'Alice',
          creatorImageSrc: 'https://images.example.com/alice.jpg',
          creatorImageAlt: 'Alice headshot'
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
          creatorImageSrc: 'https://images.example.com/alice.jpg',
          creatorImageAlt: 'Alice headshot',
          mediaUrl: null
        }
      }
    })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          creatorImageSrc: 'https://images.example.com/alice.jpg',
          creatorImageAlt: 'Alice headshot'
        })
      })
    )
  })

  it('rejects creatorImageSrc with non-https scheme', async () => {
    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: {
          teamId: 'team-1',
          title: 'X',
          creatorName: 'Alice',
          creatorImageSrc: 'http://example.com/alice.jpg'
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

  it('retries once on P2002 (slug uniqueness race) and succeeds on second attempt', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    const p2002 = new Prisma.PrismaClientKnownRequestError(
      'unique constraint failed',
      { code: 'P2002', clientVersion: '7.0.0', meta: { target: ['slug'] } }
    )
    const page = {
      id: 'p1',
      title: 'My Welcome',
      slug: 'my-welcome-2',
      status: 'draft',
      description: '',
      creatorName: 'Alice',
      creatorImageSrc: null,
      creatorImageAlt: null,
      mediaUrl: null
    }
    prismaMock.templateGalleryPage.create
      .mockRejectedValueOnce(p2002)
      .mockResolvedValueOnce(page as any)
    prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue(
      page as any
    )

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
          creatorImageSrc: null,
          creatorImageAlt: null,
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
      { code: 'P2002', clientVersion: '7.0.0', meta: { target: ['slug'] } }
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

  it('does NOT retry on a non-slug P2002 (propagates immediately)', async () => {
    prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
    prismaMock.journey.findMany.mockResolvedValue([] as any)
    const nonSlugP2002 = new Prisma.PrismaClientKnownRequestError(
      'unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.0.0',
        meta: { target: ['templateGalleryPageId'] }
      }
    )
    prismaMock.templateGalleryPage.create.mockRejectedValueOnce(nonSlugP2002)

    const result = await authClient({
      document: TEMPLATE_GALLERY_PAGE_CREATE,
      variables: {
        input: { teamId: 'team-1', title: 'X', creatorName: 'Alice' }
      }
    })

    expect(result).toEqual({ data: null, errors: [expect.anything()] })
    expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledTimes(1)
  })

  describe('media', () => {
    const TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA = graphql(`
      mutation TemplateGalleryPageCreateWithMedia(
        $input: TemplateGalleryPageCreateInput!
      ) {
        templateGalleryPageCreate(input: $input) {
          id
          media {
            id
            type
            embedUrl
            muxPlaybackId
          }
        }
      }
    `)

    function mockPageRead(media: unknown): void {
      prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([] as any)
      prismaMock.templateGalleryPage.create.mockResolvedValue({
        id: 'p1'
      } as any)
      prismaMock.templateGalleryPageMedia.create.mockResolvedValue({} as any)
      prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
        id: 'p1',
        media
      } as any)
    }

    it('creates a link media row and returns the media relation', async () => {
      mockLinkValidate.mockResolvedValue({
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc'
      })
      mockPageRead({
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
        muxPlaybackId: null
      })

      const result = (await authClient({
        document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
        variables: {
          input: {
            teamId: 'team-1',
            title: 'X',
            creatorName: 'Alice',
            media: { type: 'link', url: 'https://www.youtube.com/watch?v=abc' }
          }
        }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.templateGalleryPageCreate.media).toEqual({
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
        muxPlaybackId: null
      })
      expect(mockLinkValidate).toHaveBeenCalledWith(
        'https://www.youtube.com/watch?v=abc'
      )
      expect(prismaMock.templateGalleryPageMedia.create).toHaveBeenCalledWith({
        data: {
          templateGalleryPageId: 'p1',
          type: 'link',
          embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
          muxVideoId: null,
          muxPlaybackId: null,
          muxName: null,
          muxDuration: null
        }
      })
    })

    it('wraps a media-row P2002 as CONFLICT (no slug retry)', async () => {
      mockLinkValidate.mockResolvedValue({
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc'
      })
      prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([] as any)
      prismaMock.templateGalleryPage.create.mockResolvedValue({
        id: 'p1'
      } as any)
      const p2002 = new Prisma.PrismaClientKnownRequestError(
        'unique constraint failed',
        {
          code: 'P2002',
          clientVersion: '7.0.0',
          meta: { target: ['templateGalleryPageId'] }
        }
      )
      prismaMock.templateGalleryPageMedia.create.mockRejectedValue(p2002)

      const result = (await authClient({
        document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
        variables: {
          input: {
            teamId: 'team-1',
            title: 'X',
            creatorName: 'Alice',
            media: { type: 'link', url: 'https://www.youtube.com/watch?v=abc' }
          }
        }
      })) as any

      expect(result.errors?.[0]?.extensions?.code).toBe('CONFLICT')
      expect(result.errors?.[0]?.extensions?.field).toBe('media')
      // the media P2002 must NOT trigger the slug-regenerating retry
      expect(prismaMock.templateGalleryPage.create).toHaveBeenCalledTimes(1)
    })

    it('creates a mux media row and returns the media relation', async () => {
      mockMuxValidate.mockResolvedValue({
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb_x',
        muxName: 'My clip',
        muxDuration: 125
      })
      mockPageRead({
        id: 'm1',
        type: 'mux',
        embedUrl: null,
        muxPlaybackId: 'pb_x'
      })

      const result = (await authClient({
        document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
        variables: {
          input: {
            teamId: 'team-1',
            title: 'X',
            creatorName: 'Alice',
            media: { type: 'mux', muxVideoId: 'vid-1' }
          }
        }
      })) as any

      expect(result.errors).toBeUndefined()
      expect(result.data.templateGalleryPageCreate.media).toEqual({
        id: 'm1',
        type: 'mux',
        embedUrl: null,
        muxPlaybackId: 'pb_x'
      })
      expect(mockMuxValidate).toHaveBeenCalledWith('vid-1')
      expect(prismaMock.templateGalleryPageMedia.create).toHaveBeenCalledWith({
        data: {
          templateGalleryPageId: 'p1',
          type: 'mux',
          embedUrl: null,
          muxVideoId: 'vid-1',
          muxPlaybackId: 'pb_x',
          muxName: 'My clip',
          muxDuration: 125
        }
      })
    })

    it.each([['undefined', undefined] as const, ['null', null] as const])(
      'creates no media row when media is %s',
      async (_label, mediaInput) => {
        mockPageRead(null)

        const result = (await authClient({
          document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
          variables: {
            input: {
              teamId: 'team-1',
              title: 'X',
              creatorName: 'Alice',
              media: mediaInput
            }
          }
        })) as any

        expect(result.errors).toBeUndefined()
        expect(result.data.templateGalleryPageCreate.media).toBeNull()
        expect(
          prismaMock.templateGalleryPageMedia.create
        ).not.toHaveBeenCalled()
      }
    )

    it.each([
      [
        'link with a muxVideoId',
        { type: 'link', url: 'https://x', muxVideoId: 'v' }
      ],
      ['mux with a url', { type: 'mux', muxVideoId: 'v', url: 'https://x' }],
      ['link with no url', { type: 'link' }]
    ])('rejects %s with MEDIA_INPUT_SHAPE_MISMATCH', async (_label, media) => {
      prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([] as any)

      const result = (await authClient({
        document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
        variables: {
          input: {
            teamId: 'team-1',
            title: 'X',
            creatorName: 'Alice',
            media: media as any
          }
        }
      })) as any

      expect(result.errors?.[0]?.extensions?.reason).toBe(
        'MEDIA_INPUT_SHAPE_MISMATCH'
      )
      expect(prismaMock.templateGalleryPage.create).not.toHaveBeenCalled()
      expect(prismaMock.templateGalleryPageMedia.create).not.toHaveBeenCalled()
    })

    it('propagates a helper error (EMBED_HOST_NOT_ALLOWED) before any write', async () => {
      prismaMock.templateGalleryPage.findMany.mockResolvedValue([])
      prismaMock.journey.findMany.mockResolvedValue([] as any)
      mockLinkValidate.mockRejectedValue(
        new GraphQLError('not allowed', {
          extensions: {
            code: 'BAD_USER_INPUT',
            reason: 'EMBED_HOST_NOT_ALLOWED'
          }
        })
      )

      const result = (await authClient({
        document: TEMPLATE_GALLERY_PAGE_CREATE_WITH_MEDIA,
        variables: {
          input: {
            teamId: 'team-1',
            title: 'X',
            creatorName: 'Alice',
            media: { type: 'link', url: 'https://evil.example.com/x' }
          }
        }
      })) as any

      expect(result.errors?.[0]?.extensions?.reason).toBe(
        'EMBED_HOST_NOT_ALLOWED'
      )
      expect(prismaMock.templateGalleryPage.create).not.toHaveBeenCalled()
    })
  })
})
