import { OpenAPIHono } from '@hono/zod-openapi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import {
  PrismaClient as MediaPrismaClient,
  prisma as mediaPrisma
} from '@core/prisma/media/client'

import { mediaComponents } from './index'

vi.mock('@core/prisma/media/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/media/client')),
  prisma: mockDeep<MediaPrismaClient>()
}))

// Bypass the cache layer (which would otherwise open a real Redis
// connection) so the route's fetchFn always runs against the mocked
// Prisma client.
vi.mock('../../../../lib/cacheBypass', () => ({
  getWithStaleCacheForRequest: async (
    _c: unknown,
    _key: string,
    fetchFn: () => Promise<unknown>
  ) => await fetchFn()
}))

// The detail route mounted under the list router transitively imports the
// RSC-only Apollo client wiring; it is not exercised here.
vi.mock('./[mediaComponentId]', async () => {
  const { OpenAPIHono: Hono } =
    await vi.importActual<typeof import('@hono/zod-openapi')>(
      '@hono/zod-openapi'
    )
  return { mediaComponent: new Hono() }
})

vi.mock('../../../../lib/getLanguageIdsFromTags', async () => ({
  ...(await vi.importActual('../../../../lib/getLanguageIdsFromTags')),
  getLanguageDetailsFromTags: vi
    .fn()
    .mockResolvedValue([{ id: '529', bcp47: 'en' }])
}))

const mediaPrismaMock =
  mediaPrisma as unknown as DeepMockProxy<MediaPrismaClient>

const app = new OpenAPIHono()
app.route('/media-components', mediaComponents)

type FakeVariant = {
  languageId: string
  published: boolean
  hls: string | null
  dash: string | null
  lengthInMilliseconds: number
  downloadable: boolean
  downloads: Array<{ quality: string; size: number }>
}

// Stored in "physical" order: Postgres returns an unordered relation in
// whatever order the rows happen to sit on disk, which is not English first.
const jesusVariants: FakeVariant[] = [
  {
    languageId: '20615',
    published: false,
    hls: 'https://example.com/jf-20615.m3u8',
    dash: null,
    lengthInMilliseconds: 0,
    downloadable: false,
    downloads: []
  },
  {
    languageId: '529',
    published: true,
    hls: 'https://example.com/jf.m3u8',
    dash: null,
    lengthInMilliseconds: 7673728,
    downloadable: true,
    downloads: [
      { quality: 'low', size: 585287114 },
      { quality: 'high', size: 2962849007 }
    ]
  }
]

type VariantsArgs = {
  where?: { languageId?: string; published?: boolean }
  take?: number
}

// Applies the route's own `variants` where/take to the stored rows, the way
// Prisma would, so the test sees exactly the Variant the query selects.
function selectVariants(args: VariantsArgs | undefined): FakeVariant[] {
  const filtered = jesusVariants.filter(
    (variant) =>
      (args?.where?.languageId == null ||
        variant.languageId === args.where.languageId) &&
      (args?.where?.published == null ||
        variant.published === args.where.published)
  )
  return filtered.slice(0, args?.take ?? filtered.length)
}

function jesusVideo(variantsArgs: VariantsArgs | undefined) {
  return {
    id: '1_jf-0-0',
    label: 'featureFilm',
    primaryLanguageId: '529',
    title: [{ value: 'JESUS', languageId: '529' }],
    description: [],
    snippet: [],
    studyQuestions: [],
    images: [],
    imageAlt: [],
    bibleCitation: [],
    children: [],
    availableLanguages: ['529', '20615'],
    variants: selectVariants(variantsArgs)
  }
}

describe('GET /media-components', () => {
  beforeEach(() => {
    mockReset(mediaPrismaMock)
    mediaPrismaMock.$transaction.mockImplementation(
      async (callback: (tx: typeof mediaPrismaMock) => Promise<unknown>) =>
        await callback(mediaPrismaMock)
    )
    mediaPrismaMock.video.findMany.mockImplementation(((args: {
      select: { variants: VariantsArgs }
    }) => Promise.resolve([jesusVideo(args.select.variants)])) as never)
    mediaPrismaMock.video.count.mockResolvedValue(1)
  })

  it('reports the same Variant as the detail endpoint: the published English one', async () => {
    const res = await app.request('/media-components?ids=1_jf-0-0')

    expect(res.status).toBe(200)
    const body = await res.json()
    const [jesus] = body._embedded.mediaComponents
    expect(jesus).toMatchObject({
      mediaComponentId: '1_jf-0-0',
      isDownloadable: true,
      lengthInMilliseconds: 7673728,
      downloadSizes: {
        approximateSmallDownloadSizeInBytes: 585287114,
        approximateLargeDownloadSizeInBytes: 2962849007
      },
      componentType: 'content',
      contentType: 'video'
    })
  })

  it('selects the Variant by language and publication, not by row order', async () => {
    await app.request('/media-components?ids=1_jf-0-0')

    expect(mediaPrismaMock.video.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          variants: expect.objectContaining({
            where: { languageId: '529', published: true },
            take: 1
          })
        })
      })
    )
  })

  it('reports a generated empty parent Variant as a container, not 0-length content', async () => {
    // Generated parent Variants are stored with hls: '' rather than null.
    mediaPrismaMock.video.findMany.mockResolvedValue([
      {
        ...jesusVideo(undefined),
        id: '16_Influencers',
        label: 'series',
        variants: [
          {
            languageId: '529',
            published: true,
            hls: '',
            dash: '',
            lengthInMilliseconds: 0,
            downloadable: false,
            downloads: []
          }
        ]
      }
    ] as never)

    const res = await app.request('/media-components?ids=16_Influencers')

    const [influencers] = (await res.json())._embedded.mediaComponents
    expect(influencers).toMatchObject({
      mediaComponentId: '16_Influencers',
      componentType: 'container',
      contentType: 'none'
    })
  })

  it('reports a DASH-only Variant as content', async () => {
    mediaPrismaMock.video.findMany.mockResolvedValue([
      {
        ...jesusVideo(undefined),
        id: '1_jf-dash-only',
        variants: [
          {
            languageId: '529',
            published: true,
            hls: '',
            dash: 'https://example.com/jf.mpd',
            lengthInMilliseconds: 7673728,
            downloadable: true,
            downloads: []
          }
        ]
      }
    ] as never)

    const res = await app.request('/media-components?ids=1_jf-dash-only')

    const [jesus] = (await res.json())._embedded.mediaComponents
    expect(jesus).toMatchObject({
      mediaComponentId: '1_jf-dash-only',
      componentType: 'content',
      contentType: 'video'
    })
  })

  describe.each(['collection', 'series'])('a %s', (label) => {
    function containerVideo(downloadable: boolean) {
      return {
        ...jesusVideo(undefined),
        id: `16_${label}`,
        label,
        children: [{}, {}],
        variants: [
          {
            languageId: '529',
            published: true,
            hls: '',
            dash: '',
            lengthInMilliseconds: 0,
            downloadable,
            downloads: []
          }
        ]
      }
    }

    it('is not downloadable even when its parent Variant is flagged downloadable, because it has no video file', async () => {
      mediaPrismaMock.video.findMany.mockResolvedValue([
        containerVideo(true)
      ] as never)

      const res = await app.request(`/media-components?ids=16_${label}`)

      const [container] = (await res.json())._embedded.mediaComponents
      expect(container).toMatchObject({
        mediaComponentId: `16_${label}`,
        subType: label,
        componentType: 'container',
        contentType: 'none',
        containsCount: 2,
        isDownloadable: false,
        lengthInMilliseconds: 0,
        downloadSizes: {
          approximateSmallDownloadSizeInBytes: 0,
          approximateLargeDownloadSizeInBytes: 0
        }
      })
    })

    it('is not downloadable when its Variant is not', async () => {
      mediaPrismaMock.video.findMany.mockResolvedValue([
        containerVideo(false)
      ] as never)

      const res = await app.request(`/media-components?ids=16_${label}`)

      const [container] = (await res.json())._embedded.mediaComponents
      expect(container).toMatchObject({
        subType: label,
        isDownloadable: false
      })
    })
  })

  it('reports a series that has a real stream with its own length and sizes', async () => {
    mediaPrismaMock.video.findMany.mockResolvedValue([
      {
        ...jesusVideo(undefined),
        id: '1_series-with-stream',
        label: 'series',
        variants: jesusVariants.filter(({ languageId }) => languageId === '529')
      }
    ] as never)

    const res = await app.request('/media-components?ids=1_series-with-stream')

    const [series] = (await res.json())._embedded.mediaComponents
    expect(series).toMatchObject({
      componentType: 'content',
      isDownloadable: true,
      lengthInMilliseconds: 7673728,
      downloadSizes: {
        approximateSmallDownloadSizeInBytes: 585287114,
        approximateLargeDownloadSizeInBytes: 2962849007
      }
    })
  })

  it('reports download sizes from the Variant even when it is not downloadable, as the detail endpoint does', async () => {
    mediaPrismaMock.video.findMany.mockResolvedValue([
      {
        ...jesusVideo(undefined),
        id: '1_not-downloadable',
        variants: [{ ...jesusVariants[1], downloadable: false }]
      }
    ] as never)

    const res = await app.request('/media-components?ids=1_not-downloadable')

    const [video] = (await res.json())._embedded.mediaComponents
    expect(video).toMatchObject({
      isDownloadable: false,
      downloadSizes: {
        approximateSmallDownloadSizeInBytes: 585287114,
        approximateLargeDownloadSizeInBytes: 2962849007
      }
    })
  })

  it('is not downloadable when there is no published English Variant', async () => {
    mediaPrismaMock.video.findMany.mockResolvedValue([
      { ...jesusVideo(undefined), id: '1_no-english', variants: [] }
    ] as never)

    const res = await app.request('/media-components?ids=1_no-english')

    const [video] = (await res.json())._embedded.mediaComponents
    expect(video).toMatchObject({
      componentType: 'container',
      isDownloadable: false,
      lengthInMilliseconds: 0,
      downloadSizes: {
        approximateSmallDownloadSizeInBytes: 0,
        approximateLargeDownloadSizeInBytes: 0
      }
    })
  })
})
