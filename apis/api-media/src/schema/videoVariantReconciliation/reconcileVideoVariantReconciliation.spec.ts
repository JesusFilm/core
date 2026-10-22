import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  addLanguageToVideo,
  findContainerParentIds,
  updateParentCollectionLanguages
} from '../video/lib/updateAvailableLanguages'

import type { ReconciliationRecord } from './reconcileVideoVariantReconciliation'
import { reconcileVideoVariantReconciliation } from './reconcileVideoVariantReconciliation'

vi.mock('../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))
vi.mock('../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))
vi.mock('../video/lib/updateAvailableLanguages', () => ({
  addLanguageToVideo: vi.fn(),
  updateParentCollectionLanguages: vi.fn(),
  findContainerParentIds: vi.fn()
}))

describe('reconcileVideoVariantReconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      return await transaction(prismaMock)
    })
    // Default to "no parent containers" so tests that don't exercise the
    // parent-sync path don't need to know about findContainerParentIds.
    vi.mocked(findContainerParentIds).mockResolvedValue([])
  })

  it('publishes a Variant only after its generated parent Variant and indexes are ready', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {},
      createdAt: new Date(),
      videoVariant: {
        id: 'variant-1',
        videoId: 'episode-1',
        languageId: '20770',
        slug: 'episode-1/20770',
        published: false,
        downloadable: false,
        hls: '',
        share: '',
        muxVideo: { readyToStream: true }
      }
    }
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      reconciliation as never
    )
    vi.mocked(findContainerParentIds).mockResolvedValue(['series-1'])
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'series-1', slug: 'do-you-ever-wonder', label: 'series' }
    ] as never)
    prismaMock.videoVariant.findFirst.mockResolvedValue(null)
    prismaMock.videoVariant.create.mockResolvedValue({
      id: '20770_series-1'
    } as never)
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.videoVariant.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        id: '20770_series-1',
        videoId: 'series-1',
        languageId: '20770',
        published: false,
        downloadable: false
      })
    })
    expect(prismaMock.videoVariantReconciliation.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        reason: 'generated-parent',
        videoVariantId: '20770_series-1',
        processingStages: expect.objectContaining({
          mux: { state: 'notApplicable', attempts: 0 },
          parentSync: expect.objectContaining({ attempts: 1 }),
          downloads: { state: 'notApplicable', attempts: 0 }
        })
      })
    })
    // Bug A regression coverage: the parent-language write must route through
    // the canonical, cache-revalidating helpers rather than a hand-rolled
    // prisma.video.update.
    expect(addLanguageToVideo).toHaveBeenCalledWith('series-1', '20770')
    expect(updateParentCollectionLanguages).toHaveBeenCalledWith('series-1')
    expect(prismaMock.video.update).not.toHaveBeenCalled()
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('episode-1')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { published: true }
    })
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant-1')
    expect(result).toMatchObject({ publicationReady: true, status: 'complete' })
  })

  it('keeps a new Variant unpublished when parent indexing fails', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {},
      createdAt: new Date(),
      videoVariant: {
        id: 'variant-1',
        videoId: 'episode-1',
        languageId: '20770',
        slug: 'episode-1/20770',
        published: false,
        downloadable: false,
        hls: '',
        share: '',
        muxVideo: { readyToStream: true }
      }
    }
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      reconciliation as never
    )
    vi.mocked(findContainerParentIds).mockResolvedValue(['series-1'])
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'series-1', slug: 'do-you-ever-wonder', label: 'series' }
    ] as never)
    prismaMock.videoVariant.findFirst.mockResolvedValue(null)
    prismaMock.videoVariant.create.mockResolvedValue({
      id: '20770_series-1'
    } as never)
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1' },
      data: expect.objectContaining({
        status: 'degraded',
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({
            state: 'failed',
            error: 'Algolia unavailable',
            attempts: 1
          })
        })
      })
    })
    expect(result).toMatchObject({
      publicationReady: false,
      status: 'degraded'
    })
  })

  it('publishes with degraded health when requested Downloads are missing', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {},
      createdAt: new Date(),
      videoVariant: {
        id: 'variant-1',
        videoId: 'episode-1',
        languageId: '20770',
        slug: 'episode-1/20770',
        published: false,
        downloadable: true,
        hls: '',
        share: '',
        muxVideo: { readyToStream: true }
      }
    }
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      reconciliation as never
    )
    prismaMock.video.findMany.mockResolvedValue([])
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { published: true }
    })
    expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1' },
      data: expect.objectContaining({
        status: 'degraded',
        processingStages: expect.objectContaining({
          downloads: expect.objectContaining({ state: 'failed' })
        })
      })
    })
    expect(result).toMatchObject({ publicationReady: true, status: 'degraded' })
  })

  it('marks an unusable Variant failed after the Mux processing window', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {},
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
      videoVariant: {
        id: 'variant-1',
        videoId: 'episode-1',
        languageId: '20770',
        slug: 'episode-1/20770',
        published: false,
        downloadable: false,
        hls: '',
        share: '',
        muxVideo: { readyToStream: false }
      }
    }
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      reconciliation as never
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1' },
      data: expect.objectContaining({
        status: 'failed',
        processingStages: expect.objectContaining({
          mux: expect.objectContaining({ state: 'failed' })
        })
      })
    })
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(result).toEqual({ publicationReady: false, status: 'failed' })
  })

  it('reconciles generated parent indexes with media stages not applicable', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'generated-parent',
      videoId: 'series-1',
      languageId: '20770',
      published: true,
      videoVariantId: '20770_series-1',
      processingStages: {},
      createdAt: new Date(),
      videoVariant: {
        id: '20770_series-1',
        videoId: 'series-1',
        languageId: '20770',
        slug: 'series-1/20770',
        published: true,
        downloadable: false,
        hls: '',
        share: '',
        muxVideo: null
      }
    }
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
      reconciliation as never
    )

    const result = await reconcileVideoVariantReconciliation('status-1')

    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith({
      where: { id: 'status-1' },
      data: expect.objectContaining({
        status: 'complete',
        processingStages: expect.objectContaining({
          mux: { state: 'notApplicable', attempts: 0 },
          downloads: { state: 'notApplicable', attempts: 0 }
        })
      })
    })
    expect(result).toEqual({ publicationReady: true, status: 'complete' })
  })

  describe('when the parent is a feature film', () => {
    // JESUS (1_jf-0-0) is playable in its own right and is also the parent of
    // its segments. Its Variants must only ever be real uploads.
    function segmentReconciliation(): ReconciliationRecord {
      return {
        reason: 'video-variant-publication-change',
        videoId: '1_jf6101-0-0',
        languageId: '19372',
        published: true,
        videoVariantId: '1_19372-jf6101-0-0',
        processingStages: {},
        createdAt: new Date(),
        videoVariant: {
          id: '1_19372-jf6101-0-0',
          videoId: '1_jf6101-0-0',
          languageId: '19372',
          slug: 'jesus-chapter-1/19372',
          published: false,
          downloadable: false,
          hls: 'https://stream.example/segment.m3u8',
          share: '',
          muxVideo: { readyToStream: true }
        }
      }
    }

    beforeEach(() => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        segmentReconciliation() as never
      )
      vi.mocked(findContainerParentIds).mockResolvedValue(['1_jf-0-0'])
      prismaMock.video.findMany.mockResolvedValue([
        { id: '1_jf-0-0', slug: 'jesus', label: 'featureFilm' }
      ] as never)
      prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    })

    it('does not create a placeholder Variant for a language the film lacks', async () => {
      prismaMock.videoVariant.findFirst.mockResolvedValue(null)

      const result = await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
      expect(
        prismaMock.videoVariantReconciliation.create
      ).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: '1_19372-jf6101-0-0' },
        data: { published: true }
      })
      expect(result).toMatchObject({ publicationReady: true, status: 'complete' })
    })

    it('publishes the segment when the film already has a real Variant in that language', async () => {
      prismaMock.videoVariant.findFirst.mockResolvedValue({
        id: '1_19372-jf-0-0',
        hls: 'https://stream.example/jesus.m3u8',
        downloads: [{ id: 'download-1' }]
      } as never)

      const result = await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: '1_19372-jf-0-0' } })
      )
      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: '1_19372-jf6101-0-0' },
        data: { published: true }
      })
      expect(result).toMatchObject({ publicationReady: true, status: 'complete' })
    })
  })
})
