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

// The public-anonymous field-surface audit (NES-1547). `TemplateGalleryPage.media`
// is reachable by unauthenticated traffic via `templateGalleryPageBySlug`, so the
// exposed surface must stay narrow: only id/type/embedUrl/muxPlaybackId. These
// tests fail loudly if a future change exposes `embedHtml`, the raw `muxVideoId`
// FK, or a federated `muxVideo` relation.
describe('TemplateGalleryPageMedia field surface', () => {
  const publicClient = getClient()

  beforeEach(() => {
    vi.clearAllMocks()
    mockGetUserFromPayload.mockReturnValue(null)
  })

  it('exposes id, type, embedUrl, muxPlaybackId on the media relation', async () => {
    prismaMock.templateGalleryPage.findFirst.mockResolvedValue({
      id: 'p1',
      title: 'Hello',
      slug: 'hello',
      status: 'published',
      media: {
        id: 'm1',
        type: 'link',
        embedUrl: 'https://www.canva.com/design/x/y/view?embed',
        muxPlaybackId: null
      }
    } as any)

    const query = graphql(`
      query MediaSurface($slug: String!) {
        templateGalleryPageBySlug(slug: $slug) {
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

    const result = await publicClient({
      document: query,
      variables: { slug: 'hello' }
    })

    expect(result).toEqual({
      data: {
        templateGalleryPageBySlug: {
          id: 'p1',
          media: {
            id: 'm1',
            type: 'link',
            embedUrl: 'https://www.canva.com/design/x/y/view?embed',
            muxPlaybackId: null
          }
        }
      }
    })
  })

  // Raw documents (bypassing gql.tada typing) probing for fields that must NOT
  // exist on the public type. Each should fail GraphQL validation.
  it.each([
    ['embedHtml', 'media { embedHtml }'],
    ['muxVideoId', 'media { muxVideoId }'],
    ['muxVideo', 'media { muxVideo { id } }']
  ])('does not expose %s on the media type', async (field, selection) => {
    const document = parse(
      `query { templateGalleryPageBySlug(slug: "hello") { ${selection} } }`
    )

    const result = (await publicClient({ document })) as {
      data?: unknown
      errors?: ReadonlyArray<{ message: string }>
    }

    expect(result.errors).toBeDefined()
    expect(result.errors?.some((e) => e.message.includes(field))).toBe(true)
  })
})
