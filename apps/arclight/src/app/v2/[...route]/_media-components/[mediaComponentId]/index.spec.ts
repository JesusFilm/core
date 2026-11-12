import { OpenAPIHono } from '@hono/zod-openapi'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mockDeep } from 'vitest-mock-extended'

import { getApolloClient } from '../../../../../lib/apolloClient'

import { mediaComponent } from './index'

// Mounted at '/languages' purely for routing; unused by these tests, which
// never hit that path. Mocked so importing the route doesn't construct real
// Prisma connections.
vi.mock('@core/prisma/media/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/media/client')),
  prisma: mockDeep()
}))

vi.mock('@core/prisma/languages/client', async () => ({
  __esModule: true,
  ...(await vi.importActual('@core/prisma/languages/client')),
  prisma: mockDeep()
}))

vi.mock('../../../../../lib/apolloClient', () => ({
  getApolloClient: vi.fn()
}))

// Bypass the cache layer (which would otherwise open a real Redis
// connection) so the route's fetchFn always runs against the mocked
// Apollo client.
vi.mock('../../../../../lib/cacheBypass', () => ({
  getWithStaleCacheForRequest: async (
    _c: unknown,
    _key: string,
    fetchFn: () => Promise<unknown>
  ) => await fetchFn()
}))

const queryMock = vi.fn()
vi.mocked(getApolloClient).mockReturnValue({ query: queryMock } as never)

const app = new OpenAPIHono()
app.route('/media-components/:mediaComponentId', mediaComponent)

function baseVideo(overrides: Record<string, unknown> = {}) {
  return {
    id: '16_Influencers',
    label: 'series',
    primaryLanguageId: '529',
    images: [],
    title: [{ value: 'Influencers', language: { bcp47: 'en' } }],
    fallbackTitle: [{ value: 'Influencers' }],
    description: [],
    fallbackDescription: [],
    snippet: [],
    fallbackSnippet: [],
    studyQuestions: [],
    fallbackStudyQuestions: [],
    bibleCitations: [],
    childrenCount: 3,
    availableLanguages: ['529'],
    variant: null,
    ...overrides
  }
}

describe('GET /media-components/:mediaComponentId', () => {
  beforeEach(() => {
    queryMock.mockReset()
  })

  it('reports a generated empty parent Variant as a container, not video content', async () => {
    // Generated parent Variants are stored with hls: '' rather than null.
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          variant: {
            hls: '',
            lengthInMilliseconds: 0,
            language: { bcp47: 'en' },
            downloadable: false,
            downloads: []
          }
        })
      }
    })

    const res = await app.request('/media-components/16_Influencers')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      mediaComponentId: '16_Influencers',
      componentType: 'container',
      contentType: 'none'
    })
  })

  it('does not report a container as downloadable, even if its parent Variant is flagged downloadable', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          variant: {
            hls: '',
            lengthInMilliseconds: 0,
            language: { bcp47: 'en' },
            downloadable: true,
            downloads: []
          }
        })
      }
    })

    const res = await app.request('/media-components/16_Influencers')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      componentType: 'container',
      isDownloadable: false
    })
  })

  it('reports a Variant with a stream URL as content', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          id: '1_jf-0-0',
          label: 'featureFilm',
          variant: {
            hls: 'https://example.com/jf.m3u8',
            lengthInMilliseconds: 7673728,
            language: { bcp47: 'en' },
            downloadable: true,
            downloads: [{ quality: 'low', size: 585287114 }]
          }
        })
      }
    })

    const res = await app.request('/media-components/1_jf-0-0')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      mediaComponentId: '1_jf-0-0',
      componentType: 'content',
      contentType: 'video',
      isDownloadable: true
    })
  })

  it('does not report a Variant as downloadable when it has no download rows', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          id: '1_jf-0-0',
          label: 'featureFilm',
          variant: {
            hls: 'https://example.com/jf.m3u8',
            lengthInMilliseconds: 7673728,
            language: { bcp47: 'en' },
            downloadable: true,
            downloads: []
          }
        })
      }
    })

    const res = await app.request('/media-components/1_jf-0-0')

    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({
      componentType: 'content',
      isDownloadable: false
    })
  })

  it('reports a DASH-only Variant as content', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          id: '1_jf-dash-only',
          label: 'featureFilm',
          variant: {
            hls: '',
            dash: 'https://example.com/jf.mpd',
            lengthInMilliseconds: 7673728,
            language: { bcp47: 'en' },
            downloadable: true,
            downloads: []
          }
        })
      }
    })

    const res = await app.request('/media-components/1_jf-dash-only')

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toMatchObject({
      mediaComponentId: '1_jf-dash-only',
      componentType: 'content',
      contentType: 'video'
    })
  })

  it('reports a DASH-only Variant with download rows as downloadable, matching the Algolia rule', async () => {
    queryMock.mockResolvedValue({
      data: {
        video: baseVideo({
          id: '1_jf-dash-only',
          label: 'featureFilm',
          variant: {
            hls: '',
            dash: 'https://example.com/jf.mpd',
            lengthInMilliseconds: 7673728,
            language: { bcp47: 'en' },
            downloadable: true,
            downloads: [{ quality: 'low', size: 1000 }]
          }
        })
      }
    })

    const res = await app.request('/media-components/1_jf-dash-only')

    expect(await res.json()).toMatchObject({
      componentType: 'content',
      isDownloadable: true
    })
  })
})
