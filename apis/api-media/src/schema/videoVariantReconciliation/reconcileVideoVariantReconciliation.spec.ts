import { beforeEach, vi } from 'vitest'

import { prismaMock } from '../../../test/prismaMock'
import { updateVideoInAlgolia } from '../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../lib/algolia/algoliaVideoVariantUpdate'

import { reconcileVideoVariantReconciliation } from './reconcileVideoVariantReconciliation'

vi.mock('../../lib/algolia/algoliaVideoUpdate', () => ({
  updateVideoInAlgolia: vi.fn()
}))
vi.mock('../../lib/algolia/algoliaVideoVariantUpdate', () => ({
  updateVideoVariantInAlgolia: vi.fn()
}))

describe('reconcileVideoVariantReconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      return await transaction(prismaMock)
    })
  })

  it('publishes a Variant only after its generated parent Variant and indexes are ready', async () => {
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      id: 'reconciliation-1',
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
        published: false,
        downloadable: false,
        muxVideo: { readyToStream: true },
        video: { id: 'episode-1', published: true, label: 'episode' }
      }
    } as never)
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'series-1', slug: 'do-you-ever-wonder', availableLanguages: [] }
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
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      id: 'reconciliation-1',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {},
      videoVariant: {
        id: 'variant-1',
        videoId: 'episode-1',
        languageId: '20770',
        published: false,
        downloadable: false,
        muxVideo: { readyToStream: true },
        video: { id: 'episode-1', published: true, label: 'episode' }
      }
    } as never)
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'series-1', slug: 'do-you-ever-wonder', availableLanguages: [] }
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
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      id: 'reconciliation-1',
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
        published: false,
        downloadable: true,
        muxVideo: { readyToStream: true },
        video: { id: 'episode-1', published: true, label: 'episode' }
      }
    } as never)
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
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      id: 'reconciliation-1',
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
        published: false,
        downloadable: false,
        muxVideo: { readyToStream: false },
        video: { id: 'episode-1', published: true, label: 'episode' }
      }
    } as never)

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
    prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue({
      id: 'status-1',
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
        published: true,
        downloadable: false,
        muxVideo: null,
        video: { id: 'series-1', published: false, label: 'series' }
      }
    } as never)

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
})
