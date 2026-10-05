import { OpenAPIHono } from '@hono/zod-openapi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import {
  PrismaClient as MediaPrismaClient,
  prisma as mediaPrisma
} from '@core/prisma/media/client'

import { mediaComponentLanguage } from './index'

vi.mock('@core/prisma/media/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/media/client')),
  prisma: mockDeep<MediaPrismaClient>()
}))

vi.mock('@core/prisma/languages/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/languages/client')),
  prisma: mockDeep()
}))

// Bypass the cache layer (which would otherwise open a real Redis
// connection) so the route's fetchFn always runs against the mocked
// Prisma client.
vi.mock('../../../../../../../lib/cacheBypass', () => ({
  getWithStaleCacheForRequest: async (
    _c: unknown,
    _key: string,
    fetchFn: () => Promise<unknown>
  ) => await fetchFn()
}))

// getPlatformFromApiKey transitively imports the RSC-only Apollo client
// wiring, which isn't usable under the vitest environment. It's unrelated
// to the filtering logic under test (no apiKey is passed in these cases,
// so it's never invoked), so stub it out.
vi.mock('../../../../../../../lib/getPlatformFromApiKey', () => ({
  getDefaultPlatformForApiKey: vi.fn()
}))

const mediaPrismaMock =
  mediaPrisma as unknown as DeepMockProxy<MediaPrismaClient>

// The route reads `mediaComponentId`/`languageId` from path params, so it
// must be mounted the same way it is in production for openapi param
// validation to pass.
const app = new OpenAPIHono()
app.route(
  '/media-components/:mediaComponentId/languages/:languageId',
  mediaComponentLanguage
)

const baseVariant = {
  id: 'variant-published',
  languageId: '529',
  lengthInMilliseconds: 1000,
  hls: 'https://example.com/hls.m3u8',
  dash: null,
  share: null,
  edition: 'base',
  downloads: []
}

describe('GET /media-components/:mediaComponentId/languages/:languageId', () => {
  beforeEach(() => {
    mockReset(mediaPrismaMock)
  })

  it('requires published:true alongside languageId in the variant query', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      variants: [baseVariant],
      subtitles: []
    } as any)

    const res = await app.request('/media-components/video-1/languages/529')

    expect(res.status).toBe(200)
    expect(mediaPrismaMock.video.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          variants: expect.objectContaining({
            where: { published: true, languageId: '529' }
          })
        })
      })
    )
  })

  it('returns 404 when the requested variant is unpublished (query returns none)', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      variants: [],
      subtitles: []
    } as any)

    const res = await app.request('/media-components/video-1/languages/529')

    expect(res.status).toBe(404)
  })

  it('requires published:true for both the child "some" check and the child variant query when expanding contains', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      variants: [baseVariant],
      subtitles: [],
      children: []
    } as any)

    const res = await app.request(
      '/media-components/video-1/languages/529?expand=contains'
    )

    expect(res.status).toBe(200)
    expect(mediaPrismaMock.video.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          children: expect.objectContaining({
            where: {
              variants: { some: { published: true, languageId: '529' } }
            },
            select: expect.objectContaining({
              variants: expect.objectContaining({
                where: { published: true, languageId: '529' }
              })
            })
          })
        })
      })
    )
  })
})
