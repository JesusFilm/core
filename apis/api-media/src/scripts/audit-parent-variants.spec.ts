import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'

import { auditParentVariants } from './audit-parent-variants'

describe('auditParentVariants', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('reports a missing generated parent Variant without mutating data', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'series-1',
        slug: 'do-you-ever-wonder',
        published: true,
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
          parentVideoId: 'series-1',
          childVideoId: 'episode-1',
          languageId: '20770',
          variantId: '20770_series-1',
          action: 'createGeneratedParentVariant',
          result: 'proposed'
        }
      ],
      ambiguous: []
    })
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
  })

  it('ignores published Variants that belong to unpublished child Videos', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'series-1',
        slug: 'do-you-ever-wonder',
        published: true,
        availableLanguages: [],
        variants: [],
        children: [
          {
            id: 'unpublished-episode',
            published: false,
            variants: [
              {
                id: 'stale-published-variant',
                languageId: '20770',
                slug: 'do-you-ever-wonder/unpublished-episode/ku',
                published: true
              }
            ]
          }
        ]
      }
    ] as never)

    const result = await auditParentVariants()

    expect(result.deterministicGaps).toEqual([])
  })

  it('reports a missing parent language when the parent Variant exists', async () => {
    prismaMock.video.findMany.mockResolvedValue([
      {
        id: 'series-1',
        slug: 'do-you-ever-wonder',
        published: true,
        availableLanguages: [],
        variants: [
          {
            id: '20770_series-1',
            languageId: '20770',
            hls: '',
            dash: '',
            share: '',
            masterUrl: null,
            duration: 0,
            muxVideoId: null,
            assetId: null,
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

    const result = await auditParentVariants()

    expect(result.deterministicGaps).toContainEqual({
      parentVideoId: 'series-1',
      childVideoId: 'episode-1',
      languageId: '20770',
      variantId: '20770_series-1',
      action: 'addParentLanguage',
      result: 'proposed'
    })
  })

  it('reports a media-bearing parent Variant as ambiguous', async () => {
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
            share: '',
            masterUrl: null,
            duration: 120,
            muxVideoId: 'mux-parent',
            assetId: null,
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

    const result = await auditParentVariants()

    expect(result.deterministicGaps).toEqual([])
    expect(result.ambiguous).toEqual([
      {
        parentVideoId: 'series-1',
        languageId: '20770',
        variantId: 'uploaded-parent-variant',
        reason: 'existing parent Variant contains media'
      }
    ])
  })
})
