import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'
import {
  addLanguageToVideo,
  findContainerParentIds,
  removeLanguageFromVideoIfUnused,
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
  findContainerParentIds: vi.fn(),
  removeLanguageFromVideoIfUnused: vi.fn()
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
      { id: 'series-1', slug: 'do-you-ever-wonder' }
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

  it('keeps the child Variant unpublished, but still publishes and indexes the generated parent Variant, when the parent Video record fails to index', async () => {
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
      { id: 'series-1', slug: 'do-you-ever-wonder' }
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

    // The child Variant's own publish step never runs -- reconcileParentVariants
    // reports failure before reconcileVideoVariantReconciliation gets there.
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalledWith({
      where: { id: 'variant-1' },
      data: { published: true }
    })
    // But the generated parent Variant is still published and indexed: its own
    // Video record (series-1) failing to index must not block its Variant record.
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: '20770_series-1' },
      data: { published: true }
    })
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
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

  describe('when parent-language synchronization fails', () => {
    it('records the failure as parentSync, not algoliaVideo, for a published Variant', async () => {
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
      vi.mocked(addLanguageToVideo).mockRejectedValueOnce(
        new Error('database unavailable')
      )

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(updateVideoVariantInAlgolia).not.toHaveBeenCalled()
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            status: 'degraded',
            processingStages: expect.objectContaining({
              parentSync: expect.objectContaining({
                state: 'failed',
                error: 'database unavailable',
                attempts: 1
              }),
              algoliaVideo: expect.not.objectContaining({ state: 'failed' })
            })
          })
        }
      )
      expect(result).toEqual({ publicationReady: false, status: 'degraded' })
    })

    it('records the failure as parentSync for a delete reconciliation', async () => {
      const reconciliation: ReconciliationRecord = {
        reason: 'video-variant-delete',
        videoId: 'episode-1',
        languageId: '20770',
        published: false,
        videoVariantId: null,
        processingStages: {},
        createdAt: new Date(),
        videoVariant: null
      }
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        reconciliation as never
      )
      vi.mocked(removeLanguageFromVideoIfUnused).mockRejectedValueOnce(
        new Error('database unavailable')
      )

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            status: 'degraded',
            processingStages: expect.objectContaining({
              parentSync: expect.objectContaining({
                state: 'failed',
                attempts: 1
              })
            })
          })
        }
      )
      expect(result).toMatchObject({
        publicationReady: false,
        status: 'degraded',
        failure: { stageName: 'parentSync' }
      })
    })

    it('records the failure as parentSync when unpublishing a Variant', async () => {
      const reconciliation: ReconciliationRecord = {
        reason: 'video-variant-publication-change',
        videoId: 'episode-1',
        languageId: '20770',
        published: false,
        videoVariantId: 'variant-1',
        processingStages: {},
        createdAt: new Date(),
        videoVariant: {
          id: 'variant-1',
          videoId: 'episode-1',
          languageId: '20770',
          slug: 'episode-1/20770',
          published: true,
          downloadable: false,
          hls: '',
          share: '',
          muxVideo: { readyToStream: true }
        }
      }
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        reconciliation as never
      )
      vi.mocked(removeLanguageFromVideoIfUnused).mockRejectedValueOnce(
        new Error('database unavailable')
      )

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: 'variant-1' },
        data: { published: false }
      })
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            status: 'degraded',
            processingStages: expect.objectContaining({
              parentSync: expect.objectContaining({
                state: 'failed',
                attempts: 1
              })
            })
          })
        }
      )
      expect(result).toMatchObject({
        publicationReady: false,
        status: 'degraded',
        failure: { stageName: 'parentSync' }
      })
    })
  })

  describe('when the Video record fails to index', () => {
    const publishReconciliation = (): ReconciliationRecord => ({
      reason: 'process-video-upload',
      videoId: '2_0-La-Liberte',
      languageId: '20899',
      published: true,
      videoVariantId: '2_20899-0-La-Liberte',
      processingStages: {},
      createdAt: new Date(),
      videoVariant: {
        id: '2_20899-0-La-Liberte',
        videoId: '2_0-La-Liberte',
        languageId: '20899',
        slug: 'freedom/central-asian-russian',
        published: false,
        downloadable: false,
        hls: 'https://stream.mux.com/playback.m3u8',
        share: '',
        muxVideo: { readyToStream: true }
      }
    })
    const recordTooBig = Object.assign(
      new Error(
        'Record at the position 0 objectID=2_0-La-Liberte is too big size=102973/100000 bytes.'
      ),
      { status: 400 }
    )

    it('still publishes and indexes the Variant, and stops retrying a rejected record', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        publishReconciliation() as never
      )
      vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(recordTooBig)

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: '2_20899-0-La-Liberte' },
        data: { published: true }
      })
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '2_20899-0-La-Liberte'
      )
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            status: 'degraded',
            retryAt: null,
            errorMessage: recordTooBig.message,
            processingStages: expect.objectContaining({
              algoliaVideo: expect.objectContaining({
                state: 'failed',
                retryable: false
              }),
              algoliaVariant: expect.objectContaining({ state: 'complete' })
            })
          })
        }
      )
      expect(result).toEqual({ publicationReady: false, status: 'degraded' })
    })

    it('schedules a retry when the failure is transient', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        publishReconciliation() as never
      )
      vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
        Object.assign(new Error('Service Unavailable'), { status: 503 })
      )

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '2_20899-0-La-Liberte'
      )
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'reconciliation-1' },
          data: expect.objectContaining({
            status: 'degraded',
            retryAt: expect.any(Date),
            processingStages: expect.objectContaining({
              algoliaVideo: expect.not.objectContaining({ retryable: false })
            })
          })
        }
      )
    })

    it('still removes an unpublished Variant from the variants index', async () => {
      const reconciliation = publishReconciliation()
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        {
          ...reconciliation,
          reason: 'video-variant-publication-change',
          published: false,
          videoVariant: { ...reconciliation.videoVariant, published: true }
        } as never
      )
      vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(recordTooBig)

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: '2_20899-0-La-Liberte' },
        data: { published: false }
      })
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '2_20899-0-La-Liberte'
      )
      expect(result).toMatchObject({
        publicationReady: false,
        status: 'degraded',
        failure: { stageName: 'algoliaVideo' }
      })
    })
  })

  describe('parent Variants whose reason was overwritten by a re-request', () => {
    // 53424_Rescue: a generated parent Variant on the "Rescue" collection,
    // re-requested as video-relationship-change when its grandparent's childIds
    // changed. It has no media by design, so the general path's Mux check can
    // never pass — it must be recognised as a parent by shape.
    const parentReconciliation = (
      published: boolean
    ): ReconciliationRecord => ({
      reason: 'video-relationship-change',
      videoId: 'Rescue',
      languageId: '53424',
      published,
      videoVariantId: '53424_Rescue',
      processingStages: {},
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      videoVariant: {
        id: '53424_Rescue',
        videoId: 'Rescue',
        languageId: '53424',
        slug: 'rescue/french-african',
        published: true,
        downloadable: false,
        hls: '',
        share: '',
        muxVideo: null,
        video: { label: 'collection' }
      }
    })

    it('reconciles a media-less container Variant as a generated parent', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        parentReconciliation(true) as never
      )

      const result = await reconcileVideoVariantReconciliation('status-1')

      expect(updateVideoInAlgolia).toHaveBeenCalledWith('Rescue')
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('53424_Rescue')
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'status-1' },
          data: expect.objectContaining({
            status: 'complete',
            processingStages: expect.objectContaining({
              mux: { state: 'notApplicable', attempts: 0 }
            })
          })
        }
      )
      expect(result).toEqual({ publicationReady: true, status: 'complete' })
    })

    it('still unpublishes a parent Variant when that is the intent', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        parentReconciliation(false) as never
      )

      const result = await reconcileVideoVariantReconciliation('status-1')

      expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
        where: { id: '53424_Rescue' },
        data: { published: false }
      })
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalledWith({
        where: { id: '53424_Rescue' },
        data: { published: true }
      })
      expect(result).toEqual({ publicationReady: true, status: 'complete' })
    })

    it('does not mistake a featureFilm Variant mid-upload for a generated parent', async () => {
      // A featureFilm's own Variant, created directly via videoVariantCreate,
      // matches the shape heuristic above (container label, no muxVideo, no
      // hls/share) before its Mux upload has produced any media. Unlike the
      // Rescue case, its reason is still the original creation reason, so it
      // must fall through to the general path and wait on Mux instead of
      // being force-published as a generated parent.
      const reconciliation: ReconciliationRecord = {
        reason: 'process-video-upload',
        videoId: 'my-film',
        languageId: '529',
        published: true,
        videoVariantId: '529_my-film',
        processingStages: {},
        createdAt: new Date(),
        videoVariant: {
          id: '529_my-film',
          videoId: 'my-film',
          languageId: '529',
          slug: 'my-film/529',
          published: false,
          downloadable: false,
          hls: '',
          share: '',
          muxVideo: null,
          video: { label: 'featureFilm' }
        }
      }
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        reconciliation as never
      )

      const result = await reconcileVideoVariantReconciliation('status-1')

      expect(updateVideoInAlgolia).not.toHaveBeenCalled()
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
      expect(prismaMock.videoVariantReconciliation.update).toHaveBeenCalledWith(
        {
          where: { id: 'status-1' },
          data: expect.objectContaining({
            status: 'processing',
            processingStages: expect.objectContaining({
              mux: expect.objectContaining({ state: 'processing' })
            })
          })
        }
      )
      expect(result).toEqual({ publicationReady: false, status: 'processing' })
    })
  })
})
