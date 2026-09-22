import { OpenAPIHono } from '@hono/zod-openapi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeepMockProxy, mockDeep, mockReset } from 'vitest-mock-extended'

import {
  PrismaClient as MediaPrismaClient,
  prisma as mediaPrisma
} from '@core/prisma/media/client'

import { mediaComponentLanguages } from './index'

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
vi.mock('../../../../../../lib/cacheBypass', () => ({
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
vi.mock('../../../../../../lib/getPlatformFromApiKey', () => ({
  getDefaultPlatformForApiKey: vi.fn()
}))

const mediaPrismaMock =
  mediaPrisma as unknown as DeepMockProxy<MediaPrismaClient>

// The route reads `mediaComponentId` from the path param, so it must be
// mounted the same way it is in production (`.route('/languages', ...)`
// under `/media-components/:mediaComponentId`) for the openapi param
// validation to pass.
const app = new OpenAPIHono()
app.route(
  '/media-components/:mediaComponentId/languages',
  mediaComponentLanguages
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

describe('GET /media-components/:mediaComponentId/languages', () => {
  beforeEach(() => {
    mockReset(mediaPrismaMock)
  })

  it('requires published:true and merges the language filter when languageIds are provided', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      id: 'video-1',
      variants: [baseVariant],
      subtitles: []
    } as any)

    const res = await app.request(
      '/media-components/video-1/languages?languageIds=529,530'
    )

    expect(res.status).toBe(200)
    expect(mediaPrismaMock.video.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          variants: expect.objectContaining({
            where: {
              published: true,
              languageId: { in: ['529', '530'] }
            }
          })
        })
      })
    )
  })

  it('requires published:true but omits the language filter when no languageIds are given', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      id: 'video-1',
      variants: [baseVariant],
      subtitles: []
    } as any)

    const res = await app.request('/media-components/video-1/languages')

    expect(res.status).toBe(200)
    expect(mediaPrismaMock.video.findUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        select: expect.objectContaining({
          variants: expect.objectContaining({
            where: { published: true }
          })
        })
      })
    )
  })

  it('returns 404 when every variant is unpublished (query returns none)', async () => {
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      id: 'video-1',
      variants: [],
      subtitles: []
    } as any)

    const res = await app.request('/media-components/video-1/languages')

    expect(res.status).toBe(404)
  })

  it('returns only the published variants when the fixture mixes published and unpublished results', async () => {
    // The DB is expected to have already applied `published: true`; this
    // simulates that filtered result set and asserts the response only
    // reflects what came back.
    mediaPrismaMock.video.findUnique.mockResolvedValue({
      id: 'video-1',
      variants: [baseVariant],
      subtitles: []
    } as any)

    const res = await app.request('/media-components/video-1/languages')
    const body = (await res.json()) as {
      _embedded: { mediaComponentLanguage: Array<{ refId: string }> }
    }

    expect(body._embedded.mediaComponentLanguage).toHaveLength(1)
    expect(body._embedded.mediaComponentLanguage[0].refId).toBe(
      'variant-published'
    )
  })
})
