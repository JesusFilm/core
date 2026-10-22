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
vi.mock('./[mediaComponentId]', async () => ({
  mediaComponent: new (await import('@hono/zod-openapi')).OpenAPIHono()
}))

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
    lengthInMilliseconds: 0,
    downloadable: false,
    downloads: []
  },
  {
    languageId: '529',
    published: true,
    hls: 'https://example.com/jf.m3u8',
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
    mediaPrismaMock.$transaction.mockImplementation((async (
      callback: (tx: typeof mediaPrismaMock) => Promise<unknown>
    ) => await callback(mediaPrismaMock)) as never)
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
})
