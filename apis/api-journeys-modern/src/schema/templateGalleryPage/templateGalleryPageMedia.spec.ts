import { parse } from 'graphql'
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

// The public-anonymous field-surface audit (NES-1547) plus the both-slots
// parked-payload guard (NES-1706). `TemplateGalleryPage.media` is reachable by
// unauthenticated traffic via `templateGalleryPageBySlug`, so it must expose
// ONLY the active payload (`type` selects it) — never the raw `muxVideoId`,
// never a parked slot, never `embedHtml` or a federated `muxVideo`. The
// authenticated `templateGalleryPage` query DOES expose the full row.
describe('TemplateGalleryPageMedia field surface', () => {
  const publicClient = getClient()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  const PUBLIC_MEDIA = graphql(`
    query MediaSurface($slug: String!) {
      templateGalleryPageBySlug(slug: $slug) {
        id
        media {
          id
          type
          embedUrl
          muxPlaybackId
          muxName
          muxDuration
        }
      }
    }
  `)

  it('exposes the active mux payload and hides a parked link payload', async () => {
    // type: mux but a link is ALSO parked. Public must show the mux fields and
    // NOT the parked embedUrl.
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'p1',
      title: 'Hello',
      slug: 'hello',
      status: 'published',
      media: {
        id: 'm1',
        type: 'mux',
        embedUrl: 'https://parked.example.com/embed',
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb_x',
        muxName: 'My clip',
        muxDuration: 125
      }
    } as any)

    const result = await publicClient({
      document: PUBLIC_MEDIA,
      variables: { slug: 'hello' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageBySlug: {
          id: 'p1',
          media: {
            id: 'm1',
            type: 'mux',
            embedUrl: null,
            muxPlaybackId: 'pb_x',
            muxName: 'My clip',
            muxDuration: 125
          }
        }
      }
    })
  })

  it('exposes the active link payload and hides a parked mux payload', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'p1',
      slug: 'hello',
      status: 'published',
      media: {
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb_x',
        muxName: 'My clip',
        muxDuration: 125
      }
    } as any)

    const result = (await publicClient({
      document: PUBLIC_MEDIA,
      variables: { slug: 'hello' }
    })) as any

    expect(result.data.templateGalleryPageBySlug.media).toEqual({
      id: 'm1',
      type: 'link',
      embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
      muxPlaybackId: null,
      muxName: null,
      muxDuration: null
    })
  })

  it.each([
    [
      'type none',
      { id: 'm1', type: 'none', embedUrl: 'https://x', muxPlaybackId: 'pb' }
    ],
    [
      'link with no embedUrl',
      { id: 'm1', type: 'link', embedUrl: null, muxPlaybackId: 'pb' }
    ],
    [
      'mux with no playbackId',
      { id: 'm1', type: 'mux', embedUrl: 'https://x', muxPlaybackId: null }
    ]
  ])(
    'collapses media to null on the public page for %s',
    async (_label, media) => {
      prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
        id: 'p1',
        slug: 'hello',
        status: 'published',
        media
      } as any)

      const result = (await publicClient({
        document: PUBLIC_MEDIA,
        variables: { slug: 'hello' }
      })) as any

      expect(result.data.templateGalleryPageBySlug.media).toBeNull()
    }
  )

  // Raw documents (bypassing gql.tada typing) probing for fields that must NOT
  // exist on the PUBLIC type. Each should fail GraphQL validation.
  it.each([
    ['embedHtml', 'media { embedHtml }'],
    ['muxVideoId', 'media { muxVideoId }'],
    ['muxVideo', 'media { muxVideo { id } }']
  ])(
    'does not expose %s on the public media type',
    async (field, selection) => {
      const document = parse(
        `query { templateGalleryPageBySlug(slug: "hello") { ${selection} } }`
      )

      const result = (await publicClient({ document })) as {
        data?: unknown
        errors?: ReadonlyArray<{ message: string }>
      }

      expect(result.errors).toBeDefined()
      expect(result.errors?.some((e) => e.message.includes(field))).toBe(true)
    }
  )

  describe('admin media surface', () => {
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

    beforeEach(() => {
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

    it('exposes both parked payloads and the raw muxVideoId to authed callers', async () => {
      prismaMock.templateGalleryPage.findUnique.mockResolvedValue({
        id: 'p1',
        teamId: 'team-1'
      } as any)
      prismaMock.templateGalleryPage.findUniqueOrThrow.mockResolvedValue({
        id: 'p1',
        teamId: 'team-1',
        media: {
          id: 'm1',
          type: 'link',
          embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
          muxVideoId: 'vid-1',
          muxPlaybackId: 'pb_x',
          muxName: 'My clip',
          muxDuration: 125
        }
      } as any)

      const ADMIN_MEDIA = graphql(`
        query AdminMedia($id: ID!) {
          templateGalleryPage(id: $id) {
            id
            media {
              id
              type
              embedUrl
              muxVideoId
              muxPlaybackId
              muxName
              muxDuration
            }
          }
        }
      `)

      const result = (await authClient({
        document: ADMIN_MEDIA,
        variables: { id: 'p1' }
      })) as any

      expect(result.errors).toBeUndefined()
      // Active type is `link`, yet the parked `muxVideoId` IS exposed here so
      // the editor can offer switching back to the upload.
      expect(result.data.templateGalleryPage.media).toEqual({
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.youtube-nocookie.com/embed/abc',
        muxVideoId: 'vid-1',
        muxPlaybackId: 'pb_x',
        muxName: 'My clip',
        muxDuration: 125
      })
    })
  })
})
