import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { updateVideoInAlgolia } from '../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../lib/algolia/algoliaVideoVariantUpdate'

import { auditParentVariants } from './audit-parent-variants'

vi.mock('../lib/algolia/algoliaVideoUpdate', () => ({ updateVideoInAlgolia: vi.fn() }))
vi.mock('../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

describe('auditParentVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports relationship-based gaps without changing Draft parents by default', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'draft-series',
        slug: 'do-you-ever-wonder',
        published: false,
        availableLanguages: [],
        variants: [],
        children: [
          {
            id: 'episode-1',
            published: true,
            variants: [
              {
                id: 'kurmanji-episode-1',
                languageId: '20770',
                slug: 'do-you-ever-wonder/episode-1/ku',
                published: true
              }
            ]
          }
        ]
      }
    ] as never)

    const result = await auditParentVariants()

    expect(result).toEqual({
      applied: false,
      deterministicGaps: [
        {
          parentVideoId: 'draft-series',
          childVideoId: 'episode-1',
          languageId: '20770',
          variantId: '20770_draft-series',
          action: 'createGeneratedParentVariant',
          result: 'proposed'
        }
      ],
      ambiguous: [],
      indexingFailures: []
    })
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('applies a deterministic repair and indexes the parent records', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'draft-series',
        slug: 'do-you-ever-wonder',
        published: false,
        availableLanguages: [],
        variants: [],
        children: [
          {
            id: 'episode-1',
            published: true,
            variants: [
              {
                id: 'kurmanji-episode-1',
                languageId: '20770',
                slug: 'do-you-ever-wonder/episode-1/ku',
                published: true
              }
            ]
          }
        ]
      }
    ] as never)
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction === 'function') {
        return await transaction(prismaMock)
      }
      return await Promise.all(transaction)
    })

    const result = await auditParentVariants(true)

    expect(prismaMock.videoVariant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: '20770_draft-series',
        videoId: 'draft-series',
        languageId: '20770',
        slug: 'do-you-ever-wonder/ku',
        published: false,
        downloadable: false
      })
    })
    expect(prismaMock.video.update).toHaveBeenCalledWith({
      where: { id: 'draft-series' },
      data: { availableLanguages: ['20770'] }
    })
    expect(prismaMock.videoVariantUpload.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        source: 'generated-parent',
        canonical: true,
        videoVariantId: '20770_draft-series'
      })
    })
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('draft-series')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_draft-series')
    expect(result.deterministicGaps[0].result).toBe('applied')
    expect(result.indexingFailures).toEqual([])
  })

  it('reports a media-bearing parent Variant as ambiguous without mutation', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'series-1',
        slug: 'do-you-ever-wonder',
        published: true,
        availableLanguages: [],
        variants: [
          {
            id: 'uploaded-parent-variant',
            languageId: '20770',
            hls: 'https://stream.example/parent.m3u8',
            dash: '',
            duration: 120,
            muxVideoId: 'mux-parent',
            downloads: []
          }
        ],
        children: [
          {
            id: 'episode-1',
            published: true,
            variants: [
              {
                id: 'kurmanji-episode-1',
                languageId: '20770',
                slug: 'do-you-ever-wonder/episode-1/ku',
                published: true
              }
            ]
          }
        ]
      }
    ] as never)

    const result = await auditParentVariants(true)

    expect(result.deterministicGaps).toEqual([])
    expect(result.ambiguous).toEqual([
      {
        parentVideoId: 'series-1',
        languageId: '20770',
        variantId: 'uploaded-parent-variant',
        reason: 'existing parent Variant contains media'
      }
    ])
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('preserves database repair and reports the specific failed index stage', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'series-1', slug: 'do-you-ever-wonder', published: true,
        availableLanguages: [], variants: [],
        children: [{
          id: 'episode-1', published: true,
          variants: [{
            id: 'kurmanji-episode-1', languageId: '20770',
            slug: 'do-you-ever-wonder/episode-1/ku', published: true
          }]
        }]
      }
    ] as never)
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      if (typeof transaction === 'function') return await transaction(prismaMock)
      return await Promise.all(transaction)
    })
    vi.mocked(updateVideoVariantInAlgolia).mockRejectedValueOnce(
      new Error('Variant index unavailable')
    )

    const result = await auditParentVariants(true)

    expect(result.deterministicGaps[0].result).toBe('applied')
    expect(result.indexingFailures).toEqual([
      {
        parentVideoId: 'series-1',
        languageId: '20770',
        variantId: '20770_series-1',
        error: 'Variant index unavailable'
      }
    ])
    expect(prismaMock.videoVariantUpload.update).toHaveBeenLastCalledWith({
      where: { id: 'status_20770_series-1' },
      data: expect.objectContaining({
        status: 'degraded',
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({ state: 'complete' }),
          algoliaVariant: expect.objectContaining({
            state: 'failed', error: 'Variant index unavailable'
          })
        })
      })
    })
  })
})
