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
import { unsyncedGeneratedParentStages } from './reconciliationStages'

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

// The child Variant is published by a single conditional UPDATE gated on the
// reconciliation row's live `published` (see reconcileVideoVariantReconciliation),
// not by prisma.videoVariant.update.
function expectAtomicPublish(videoVariantId: string): void {
  expect(
    prismaMock.$executeRaw.mock.calls.some(
      ([, ...values]) =>
        values.length === 2 && values.every((value) => value === videoVariantId)
    )
  ).toBe(true)
}

// The unpublish write is the mirror image: a single conditional UPDATE gated
// on the reconciliation row's live `published` still being false, so a stale
// Draft run cannot undo a publish requested while it was in flight.
function unpublishWrites(videoVariantId: string): unknown[][] {
  return prismaMock.$executeRaw.mock.calls.filter(([sqlParts, ...values]) => {
    const sql = (sqlParts as readonly string[]).join(' ')
    return (
      sql.includes('SET published = false') &&
      values.length === 2 &&
      values.every((value) => value === videoVariantId)
    )
  })
}

function expectAtomicUnpublish(videoVariantId: string): void {
  const writes = unpublishWrites(videoVariantId)
  expect(writes).toHaveLength(1)
  const sql = (writes[0][0] as readonly string[]).join(' ')
  expect(sql).toContain('EXISTS')
  expect(sql).toMatch(/"VideoVariantReconciliation"[\s\S]*published = false/)
}

describe('reconcileVideoVariantReconciliation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    prismaMock.$transaction.mockImplementation(async (transaction) => {
      return await transaction(prismaMock)
    })
    // Default to "no parent containers" so tests that don't exercise the
    // parent-sync path don't need to know about findContainerParentIds.
    vi.mocked(findContainerParentIds).mockResolvedValue([])
    // Default to the atomic publish check succeeding so tests that don't
    // exercise the race condition it guards against don't need to know about it.
    prismaMock.$executeRaw.mockResolvedValue(1)
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
    // Regression guard: the publish write must be a single atomic conditional
    // UPDATE gated on the reconciliation row's current state, not a blind
    // write based on the (possibly stale) snapshot read at the top of the sweep.
    const [sqlParts, ...values] = prismaMock.$executeRaw.mock.calls[0] as [
      readonly string[],
      ...unknown[]
    ]
    expect(sqlParts.join(' ')).toContain('EXISTS')
    expect(values).toEqual(['variant-1', 'variant-1'])
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant-1')
    expect(result).toMatchObject({ publicationReady: true, status: 'complete' })
  })

  it('does not publish when a concurrent Draft request wins before the write', async () => {
    // Simulates an editor's explicit unpublish landing between this sweep's
    // initial read (at the top of the function) and its publish write: the
    // reconciliation row's published column is no longer true by the time
    // the atomic UPDATE runs, so it must affect zero rows.
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
    prismaMock.video.findMany.mockResolvedValue([])
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    prismaMock.$executeRaw.mockResolvedValue(0)

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.$executeRaw).toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(result).toMatchObject({ publicationReady: true, status: 'complete' })
  })

  it('does not roll back published when the Algolia variant update fails after publishing', async () => {
    // Regression guard: a rollback here used to be unconditional, so it could
    // stomp a fresh explicit republish that landed between this sweep's
    // publish write and the (failing) Algolia call.
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
    prismaMock.video.findMany.mockResolvedValue([])
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    vi.mocked(updateVideoVariantInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(prismaMock.$executeRaw).toHaveBeenCalled()
    expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        processingStages: expect.objectContaining({
          algoliaVariant: expect.objectContaining({
            state: 'failed',
            error: 'Algolia unavailable'
          })
        })
      })
    })
    expect(result).toMatchObject({
      publicationReady: false,
      status: 'degraded'
    })
  })

  // A featureFilm parent (1_jf-0-0) legitimately has real media in every
  // language it is dubbed in, so its chapter children hit this path routinely.
  // Treating that as "requires operator review" blocked the child's own
  // publication and alerted #data-lang-products every 15-minute sweep.
  it.each([
    ['hls', { hls: 'https://arc.gt/parent.m3u8' }],
    ['share', { share: 'https://arc.gt/parent-share' }],
    ['duration', { duration: 7860 }],
    ['downloads', { downloads: [{ id: 'download-1' }] }]
  ])(
    'publishes a child Variant when its container parent already has a Variant with %s',
    async (_field, parentMedia) => {
      const reconciliation: ReconciliationRecord = {
        reason: 'video-variant-publication-change',
        videoId: '1_jf6142-0-0',
        languageId: '145621',
        published: true,
        videoVariantId: '1_145621-jf6142-0-0',
        processingStages: {},
        createdAt: new Date(),
        videoVariant: {
          id: '1_145621-jf6142-0-0',
          videoId: '1_jf6142-0-0',
          languageId: '145621',
          slug: 'jesus/145621',
          published: false,
          downloadable: false,
          hls: 'https://arc.gt/child.m3u8',
          share: '',
          muxVideo: { readyToStream: true }
        }
      }
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        reconciliation as never
      )
      vi.mocked(findContainerParentIds).mockResolvedValue(['1_jf-0-0'])
      prismaMock.video.findMany.mockResolvedValue([
        { id: '1_jf-0-0', slug: 'jesus' }
      ] as never)
      prismaMock.videoVariant.findFirst.mockResolvedValue({
        id: '1_145621-jf-0-0',
        videoId: '1_jf-0-0',
        languageId: '145621',
        hls: '',
        dash: '',
        share: '',
        duration: 0,
        downloads: [],
        ...parentMedia
      } as never)
      prismaMock.videoVariantDownload.count.mockResolvedValue(0)

      const result =
        await reconcileVideoVariantReconciliation('reconciliation-1')

      // The existing parent Variant is never rewritten -- only the parent's
      // availableLanguages and the search indexes are refreshed.
      expect(prismaMock.videoVariant.create).not.toHaveBeenCalled()
      expect(addLanguageToVideo).toHaveBeenCalledWith('1_jf-0-0', '145621')
      expect(updateVideoInAlgolia).toHaveBeenCalledWith('1_jf-0-0')
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '1_145621-jf-0-0'
      )
      // The child itself publishes and indexes rather than being stranded.
      expectAtomicPublish('1_145621-jf6142-0-0')
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '1_145621-jf6142-0-0'
      )
      expect(result).toMatchObject({
        publicationReady: true,
        status: 'complete'
      })
    }
  )

  it('still publishes the child Variant, and the generated parent Variant, when a newly-created parent Video record fails to index', async () => {
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

    // The generated parent Variant is published and indexed: its own Video
    // record (series-1) failing to index must not block its Variant record.
    expect(prismaMock.videoVariant.update).toHaveBeenCalledWith({
      where: { id: '20770_series-1' },
      data: { published: true }
    })
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    // Nor does the parent's Video-index failure block the real child
    // Variant -- it must still publish and index.
    expectAtomicPublish('variant-1')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant-1')
    // The parent's failure stays recorded even though the child's own
    // (successful) Video record sync runs afterward on the same shared
    // algoliaVideo stage -- a later success must not erase it.
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        errorMessage: 'Algolia unavailable',
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({
            state: 'failed',
            error: 'Algolia unavailable'
          })
        })
      })
    })
    // The brand-new parent row records this as its first attempt, not its
    // second -- otherwise its retry backoff starts one step ahead.
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'status_20770_series-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        processingStages: expect.objectContaining({
          parentSync: expect.objectContaining({ attempts: 1 }),
          algoliaVideo: expect.objectContaining({
            state: 'failed',
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

  it('still publishes the child Variant when an existing parent Variant fails to index its Video record', async () => {
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
    // The parent Variant already exists and carries no media of its own, so
    // this exercises reconcileParentVariant's existing-parent branch rather
    // than the generated-parent creation path above.
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: '20770_series-1',
      hls: '',
      dash: '',
      share: '',
      downloads: []
    } as never)
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    // The existing parent Variant is still indexed despite its Video record
    // (series-1) failing to index.
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('20770_series-1')
    // The parent's Video-index failure must not block the real child Variant.
    expectAtomicPublish('variant-1')
    expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith('variant-1')
    // The parent's failure stays recorded even though the child's own
    // (successful) Video record sync runs afterward on the same shared
    // algoliaVideo stage -- a later success must not erase it.
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        errorMessage: 'Algolia unavailable',
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({
            state: 'failed',
            error: 'Algolia unavailable',
            // A single sweep syncs two Video records (the parent container's,
            // then the child's own) on this one shared algoliaVideo slot --
            // attempts must advance by 1 for the run, not once per videoId.
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

  it('counts a single attempt even when both the parent and child Video-index syncs fail in one run', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      processingStages: {
        algoliaVideo: { state: 'failed', attempts: 2 }
      },
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
    prismaMock.videoVariant.findFirst.mockResolvedValue({
      id: '20770_series-1',
      hls: '',
      dash: '',
      share: '',
      downloads: []
    } as never)
    prismaMock.videoVariantDownload.count.mockResolvedValue(0)
    vi.mocked(updateVideoInAlgolia)
      .mockRejectedValueOnce(new Error('Algolia unavailable'))
      .mockRejectedValueOnce(new Error('Algolia unavailable'))

    await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(updateVideoInAlgolia).toHaveBeenCalledWith('series-1')
    expect(updateVideoInAlgolia).toHaveBeenCalledWith('episode-1')
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({
            state: 'failed',
            attempts: 3
          })
        })
      })
    })
  })

  it('keeps an earlier parent’s parentSync failure when a later parent syncs cleanly but fails its Video record', async () => {
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
    vi.mocked(findContainerParentIds).mockResolvedValue([
      'series-1',
      'collection-1'
    ])
    prismaMock.video.findMany.mockResolvedValue([
      { id: 'series-1', slug: 'do-you-ever-wonder' },
      { id: 'collection-1', slug: 'wonder-collection' }
    ] as never)
    prismaMock.videoVariant.findFirst.mockResolvedValueOnce({
      id: '20770_series-1',
      hls: '',
      dash: '',
      share: '',
      downloads: []
    } as never)
    prismaMock.videoVariant.findFirst.mockResolvedValueOnce({
      id: '20770_collection-1',
      hls: '',
      dash: '',
      share: '',
      downloads: []
    } as never)
    // The first parent's language write fails; the second parent's succeeds
    // but its Video record then fails to index.
    vi.mocked(addLanguageToVideo).mockRejectedValueOnce(
      new Error('database unavailable')
    )
    vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(addLanguageToVideo).toHaveBeenCalledWith('series-1', '20770')
    expect(addLanguageToVideo).toHaveBeenCalledWith('collection-1', '20770')
    // The second parent's clean sync must not erase the first parent's
    // failure, or the last snapshot would show only algoliaVideo failed and
    // the row would never alert. The first failure also keeps driving
    // errorMessage/retryAt, not the later Video record failure.
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenLastCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        errorMessage: 'database unavailable',
        processingStages: expect.objectContaining({
          parentSync: expect.objectContaining({
            state: 'failed',
            error: 'database unavailable',
            attempts: 1
          }),
          algoliaVideo: expect.objectContaining({ state: 'failed' })
        })
      })
    })
    expect(result).toEqual({ publicationReady: false, status: 'degraded' })
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

    expect(prismaMock.$executeRaw).toHaveBeenCalled()
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        processingStages: expect.objectContaining({
          downloads: expect.objectContaining({ state: 'failed' })
        })
      })
    })
    expect(result).toMatchObject({ publicationReady: true, status: 'degraded' })
  })

  it('still schedules a Downloads retry when algoliaVideo has exhausted its own backoff', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'video-variant-publication-change',
      videoId: 'episode-1',
      languageId: '20770',
      published: true,
      videoVariantId: 'variant-1',
      // algoliaVideo is one sync away from retryAtFor's 5-attempt cutoff, so
      // this run's failure would otherwise persist retryAt: null.
      processingStages: { algoliaVideo: { state: 'failed', attempts: 4 } },
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
    vi.mocked(updateVideoInAlgolia).mockRejectedValueOnce(
      new Error('Algolia unavailable')
    )

    const result = await reconcileVideoVariantReconciliation('reconciliation-1')

    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'degraded',
        // Downloads' own 24h-bounded retry wins out over algoliaVideo's
        // exhausted, null-returning backoff, so the record stays due.
        retryAt: expect.any(Date),
        errorMessage: 'Requested Downloads are not ready',
        processingStages: expect.objectContaining({
          algoliaVideo: expect.objectContaining({
            state: 'failed',
            attempts: 5
          }),
          downloads: expect.objectContaining({ state: 'failed' })
        })
      })
    })
    expect(result).toMatchObject({
      publicationReady: false,
      status: 'degraded'
    })
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

    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
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
    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'status-1', createdAt: expect.any(Date) },
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

  it('counts the first sweep of a parent Variant created on publish as attempt 1', async () => {
    const reconciliation: ReconciliationRecord = {
      reason: 'generated-parent',
      videoId: 'series-1',
      languageId: '20770',
      published: true,
      videoVariantId: '20770_series-1',
      processingStages: unsyncedGeneratedParentStages(),
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

    await reconcileVideoVariantReconciliation('status_20770_series-1')

    expect(
      prismaMock.videoVariantReconciliation.updateMany
    ).toHaveBeenCalledWith({
      where: { id: 'status_20770_series-1', createdAt: expect.any(Date) },
      data: expect.objectContaining({
        status: 'complete',
        processingStages: expect.objectContaining({
          parentSync: expect.objectContaining({ attempts: 1 }),
          algoliaVideo: expect.objectContaining({ attempts: 1 })
        })
      })
    })
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
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
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
      })
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

      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
        data: expect.objectContaining({
          status: 'degraded',
          processingStages: expect.objectContaining({
            parentSync: expect.objectContaining({
              state: 'failed',
              attempts: 1
            })
          })
        })
      })
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

      expectAtomicUnpublish('variant-1')
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
        data: expect.objectContaining({
          status: 'degraded',
          processingStages: expect.objectContaining({
            parentSync: expect.objectContaining({
              state: 'failed',
              attempts: 1
            })
          })
        })
      })
      expect(result).toMatchObject({
        publicationReady: false,
        status: 'degraded',
        failure: { stageName: 'parentSync' }
      })
    })
  })

  describe('when a publish lands while an unpublish run is in flight', () => {
    const unpublishReconciliation = (): ReconciliationRecord => ({
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
    })

    it('keeps the Variant and its language when the reconciliation row no longer asks for Draft', async () => {
      // The editor republished after this stale Draft run read its row, so
      // the conditional UPDATE matches nothing.
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        unpublishReconciliation() as never
      )
      prismaMock.$executeRaw.mockResolvedValue(0)

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expectAtomicUnpublish('variant-1')
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
      expect(removeLanguageFromVideoIfUnused).not.toHaveBeenCalled()
      expect(updateParentCollectionLanguages).not.toHaveBeenCalled()
    })

    it('removes the language and updates parent collections when the unpublish applies', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        unpublishReconciliation() as never
      )
      prismaMock.$executeRaw.mockResolvedValue(1)

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(removeLanguageFromVideoIfUnused).toHaveBeenCalledWith(
        'episode-1',
        '20770'
      )
      expect(updateParentCollectionLanguages).toHaveBeenCalledWith('episode-1')
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

      expectAtomicPublish('2_20899-0-La-Liberte')
      expect(updateVideoVariantInAlgolia).toHaveBeenCalledWith(
        '2_20899-0-La-Liberte'
      )
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
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
      })
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
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'reconciliation-1', createdAt: expect.any(Date) },
        data: expect.objectContaining({
          status: 'degraded',
          retryAt: expect.any(Date),
          processingStages: expect.objectContaining({
            algoliaVideo: expect.not.objectContaining({ retryable: false })
          })
        })
      })
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

      expectAtomicUnpublish('2_20899-0-La-Liberte')
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
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'status-1', createdAt: expect.any(Date) },
        data: expect.objectContaining({
          status: 'complete',
          processingStages: expect.objectContaining({
            mux: { state: 'notApplicable', attempts: 0 }
          })
        })
      })
      expect(result).toEqual({ publicationReady: true, status: 'complete' })
    })

    it('still unpublishes a parent Variant when that is the intent', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        parentReconciliation(false) as never
      )

      const result = await reconcileVideoVariantReconciliation('status-1')

      expectAtomicUnpublish('53424_Rescue')
      expect(prismaMock.videoVariant.update).not.toHaveBeenCalled()
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
      expect(
        prismaMock.videoVariantReconciliation.updateMany
      ).toHaveBeenCalledWith({
        where: { id: 'status-1', createdAt: expect.any(Date) },
        data: expect.objectContaining({
          status: 'processing',
          processingStages: expect.objectContaining({
            mux: expect.objectContaining({ state: 'processing' })
          })
        })
      })
      expect(result).toEqual({ publicationReady: false, status: 'processing' })
    })
  })

  // The sweep reads its row once, then spends seconds on parent sync and
  // Algolia before writing the outcome. An editor's publish/Draft in that
  // window re-requests the row (fresh `published`, status processing,
  // createdAt reset). Stage, 2_529-0-HarshVibe: a Draft run's final
  // `complete` landed on top of the editor's publish request and wiped it.
  describe('when the row is re-requested while this run is in flight', () => {
    const runCreatedAt = new Date('2026-10-22T13:45:00.000Z')
    type LiveRow = {
      id: string
      createdAt: Date
      status: string
      published: boolean
      retryAt: Date | null
    }
    let liveRow: LiveRow

    function matches(where: { id: string; createdAt?: Date }): boolean {
      return (
        where.id === liveRow.id &&
        (where.createdAt == null ||
          where.createdAt.getTime() === liveRow.createdAt.getTime())
      )
    }

    // What requestVideoVariantReconciliation does to the row on an explicit
    // toggle.
    function editorRerequests(published: boolean): void {
      liveRow = {
        ...liveRow,
        createdAt: new Date('2026-10-22T13:47:41.000Z'),
        status: 'processing',
        published,
        retryAt: new Date('2026-10-22T13:47:41.000Z')
      }
    }

    beforeEach(() => {
      vi.mocked(updateVideoVariantInAlgolia).mockResolvedValue(true)
      liveRow = {
        id: 'reconciliation-1',
        createdAt: runCreatedAt,
        status: 'processing',
        published: false,
        retryAt: null
      }
      prismaMock.videoVariantReconciliation.update.mockImplementation((async ({
        where,
        data
      }: {
        where: { id: string; createdAt?: Date }
        data: Partial<LiveRow>
      }) => {
        if (matches(where)) liveRow = { ...liveRow, ...data }
        return liveRow
      }) as never)
      prismaMock.videoVariantReconciliation.updateMany.mockImplementation(
        (async ({
          where,
          data
        }: {
          where: { id: string; createdAt?: Date }
          data: Partial<LiveRow>
        }) => {
          if (!matches(where)) return { count: 0 }
          liveRow = { ...liveRow, ...data }
          return { count: 1 }
        }) as never
      )
    })

    function record(published: boolean): ReconciliationRecord {
      return {
        reason: 'video-variant-publication-change',
        videoId: '2_0-HarshVibe',
        languageId: '529',
        published,
        videoVariantId: '2_529-0-HarshVibe',
        processingStages: {},
        createdAt: runCreatedAt,
        videoVariant: {
          id: '2_529-0-HarshVibe',
          videoId: '2_0-HarshVibe',
          languageId: '529',
          slug: 'harsh-vibe/english',
          published: !published,
          downloadable: false,
          hls: 'hls',
          share: 'share',
          muxVideo: { readyToStream: true }
        }
      }
    }

    it('leaves a publish requested during a Draft run for the next sweep', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        record(false) as never
      )
      vi.mocked(updateVideoVariantInAlgolia).mockImplementation(async () => {
        editorRerequests(true)
        return true
      })

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(liveRow).toMatchObject({
        status: 'processing',
        published: true,
        retryAt: new Date('2026-10-22T13:47:41.000Z')
      })
    })

    it('leaves a Draft requested during a publish run for the next sweep', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        record(true) as never
      )
      prismaMock.videoVariantDownload.count.mockResolvedValue(0)
      vi.mocked(updateVideoVariantInAlgolia).mockImplementation(async () => {
        editorRerequests(false)
        return true
      })

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(liveRow).toMatchObject({ status: 'processing', published: false })
    })

    it('leaves a request made while waiting on Mux due now', async () => {
      const waiting = record(true)
      waiting.videoVariant = {
        ...waiting.videoVariant!,
        hls: '',
        share: '',
        muxVideo: { readyToStream: false }
      }
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockImplementation(
        (async () => {
          editorRerequests(false)
          return waiting
        }) as never
      )

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(liveRow).toMatchObject({
        status: 'processing',
        published: false,
        retryAt: new Date('2026-10-22T13:47:41.000Z')
      })
    })

    it('still records the outcome when nothing re-requested the row', async () => {
      prismaMock.videoVariantReconciliation.findUniqueOrThrow.mockResolvedValue(
        record(false) as never
      )

      await reconcileVideoVariantReconciliation('reconciliation-1')

      expect(liveRow).toMatchObject({ status: 'complete', published: false })
    })
  })
})
