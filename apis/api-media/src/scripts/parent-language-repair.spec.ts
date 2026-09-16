import { beforeEach, describe, expect, it, vi } from 'vitest'

import { prismaMock } from '../../test/prismaMock'
import { updateVideoInAlgolia } from '../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../lib/algolia/algoliaVideoVariantUpdate'

import type { ParentVariantAuditEntry } from './audit-parent-variants'
import { applyParentLanguageRepairs } from './parent-language-repair'

vi.mock('../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))
vi.mock('../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

const createGap: ParentVariantAuditEntry = {
  parentVideoId: 'series-1',
  childVideoId: 'episode-1',
  languageId: '20770',
  variantId: '20770_series-1',
  action: 'createGeneratedParentVariant',
  result: 'proposed'
}

const addLanguageGap: ParentVariantAuditEntry = {
  parentVideoId: 'series-1',
  childVideoId: 'episode-1',
  languageId: '20770',
  variantId: '20770_series-1',
  action: 'addParentLanguage',
  result: 'proposed'
}

// Backs the real (unmocked) createEmptyParentVariant helper so these tests
// exercise the actual scoped-write path rather than mocking it away.
function mockCreateEmptyParentVariantPrisma(): void {
  ;(prismaMock.videoVariant.findFirst as any).mockImplementation(
    async (args: any) => {
      if (args?.where?.videoId != null) return null
      return { slug: `do-you-ever-wonder/episode-1/ku` }
    }
  )
  prismaMock.video.findUnique.mockResolvedValue({
    slug: 'do-you-ever-wonder',
    availableLanguages: []
  } as any)
  prismaMock.$transaction.mockImplementation(
    async (callback: any) => await callback(prismaMock)
  )
  prismaMock.videoVariant.create.mockResolvedValue({
    id: '20770_series-1'
  } as any)
  prismaMock.video.update.mockResolvedValue({} as any)
}

describe('applyParentLanguageRepairs', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('dry run never writes or indexes, and passes pendingIndexRetries through unchanged', async () => {
    const pendingIndexRetries = [
      {
        parentVideoId: 'series-2',
        childVideoId: 'episode-2',
        languageId: '6788',
        variantId: '6788_series-2',
        action: 'createGeneratedParentVariant' as const
      }
    ]

    const result = await applyParentLanguageRepairs([createGap], {
      apply: false,
      pendingIndexRetries
    })

    expect(result).toEqual({
      applied: false,
      repaired: [],
      indexIncomplete: [],
      failed: [],
      pendingIndexRetries
    })
    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).not.toHaveBeenCalled()
    expect(updateVideoVariantInAlgolia).not.toHaveBeenCalled()
  })

  it('creates the missing generated parent Variant and indexes it', async () => {
    mockCreateEmptyParentVariantPrisma()

    const result = await applyParentLanguageRepairs([createGap], {
      apply: true
    })

    expect(prismaMock.videoVariant.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          videoId: 'series-1',
          languageId: '20770'
        })
      })
    )
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    expect(result.repaired).toEqual([
      {
        parentVideoId: 'series-1',
        childVideoId: 'episode-1',
        languageId: '20770',
        action: 'createGeneratedParentVariant',
        variantId: '20770_series-1',
        result: 'repaired'
      }
    ])
    expect(result.failed).toEqual([])
    expect(result.indexIncomplete).toEqual([])
    expect(result.pendingIndexRetries).toEqual([])
  })

  it('keeps the database write when indexing fails, and reports the entry for retry', async () => {
    mockCreateEmptyParentVariantPrisma()
    vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await applyParentLanguageRepairs([createGap], {
      apply: true
    })

    expect(prismaMock.videoVariant.create).toHaveBeenCalledTimes(1)
    expect(result.repaired).toEqual([])
    expect(result.indexIncomplete).toEqual([
      expect.objectContaining({
        parentVideoId: 'series-1',
        variantId: '20770_series-1',
        result: 'indexIncomplete',
        error: 'Algolia unavailable'
      })
    ])
    expect(result.pendingIndexRetries).toEqual([
      {
        parentVideoId: 'series-1',
        childVideoId: 'episode-1',
        languageId: '20770',
        variantId: '20770_series-1',
        action: 'createGeneratedParentVariant'
      }
    ])
  })

  it('performs no further writes when the generated parent Variant already exists (idempotent rerun)', async () => {
    ;(prismaMock.videoVariant.findFirst as any).mockResolvedValue({
      id: '20770_series-1'
    })

    const result = await applyParentLanguageRepairs([createGap], {
      apply: true
    })

    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.$transaction).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(result.repaired).toHaveLength(1)
  })

  it('adds the missing parent language and indexes when the parent Variant already exists without media', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      availableLanguages: []
    } as any)
    prismaMock.videoVariant.findUnique.mockResolvedValue({
      id: '20770_series-1',
      hls: '',
      dash: '',
      share: '',
      masterUrl: null,
      duration: 0,
      muxVideoId: null,
      assetId: null,
      published: true,
      downloads: []
    } as any)

    const result = await applyParentLanguageRepairs([addLanguageGap], {
      apply: true
    })

    expect(prismaMock.video.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'series-1' },
        data: { availableLanguages: { set: ['20770'] } }
      })
    )
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    expect(result.repaired).toEqual([
      {
        parentVideoId: 'series-1',
        childVideoId: 'episode-1',
        languageId: '20770',
        action: 'addParentLanguage',
        variantId: '20770_series-1',
        result: 'repaired'
      }
    ])
  })

  it('refuses to overwrite a parent Variant that gained media since the dry-run scan', async () => {
    prismaMock.video.findUnique.mockResolvedValue({
      availableLanguages: []
    } as any)
    prismaMock.videoVariant.findUnique.mockResolvedValue({
      id: '20770_series-1',
      hls: 'https://stream.example/parent.m3u8',
      dash: '',
      share: '',
      masterUrl: null,
      duration: 120,
      muxVideoId: 'mux-parent',
      assetId: null,
      published: true,
      downloads: []
    } as any)

    const result = await applyParentLanguageRepairs([addLanguageGap], {
      apply: true
    })

    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).not.toHaveBeenCalled()
    expect(result.failed).toEqual([
      expect.objectContaining({
        parentVideoId: 'series-1',
        result: 'failed',
        error: expect.stringContaining('now contains media')
      })
    ])
  })

  it('retries indexing for a carried-over entry without repeating the database write', async () => {
    const pendingIndexRetries = [
      {
        parentVideoId: 'series-2',
        childVideoId: 'episode-2',
        languageId: '6788',
        variantId: '6788_series-2',
        action: 'createGeneratedParentVariant' as const
      }
    ]

    const result = await applyParentLanguageRepairs([], {
      apply: true,
      pendingIndexRetries
    })

    expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-2')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('6788_series-2')
    expect(result.repaired).toEqual([
      { ...pendingIndexRetries[0], result: 'repaired' }
    ])
    expect(result.pendingIndexRetries).toEqual([])
  })
})
