import { Job } from 'bullmq'
import { Logger } from 'pino'
import { vi } from 'vitest'

import { jobName } from './config'
import {
  enqueueVideoAlgoliaSync,
  mergeScope,
  videoOnlyScope
} from './enqueueVideoAlgoliaSync'
import { queue } from './queue'
import { VideoAlgoliaSyncJobData } from './types'

const mockedQueueAdd = vi.mocked(queue.add)
const mockedGetJob = vi.mocked(queue.getJob)

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger

function fakeJob(
  data: VideoAlgoliaSyncJobData,
  state: {
    isWaiting?: boolean
    isDelayed?: boolean
    isFailed?: boolean
  } = {}
): Job<VideoAlgoliaSyncJobData> {
  return {
    data,
    isWaiting: vi.fn().mockResolvedValue(state.isWaiting ?? false),
    isDelayed: vi.fn().mockResolvedValue(state.isDelayed ?? false),
    isFailed: vi.fn().mockResolvedValue(state.isFailed ?? false),
    updateData: vi.fn().mockResolvedValue(undefined),
    remove: vi.fn().mockResolvedValue(undefined)
  } as unknown as Job<VideoAlgoliaSyncJobData>
}

describe('enqueueVideoAlgoliaSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockedGetJob.mockResolvedValue(undefined)
  })

  it('enqueues a durable, per-video-deduped job when none is pending', async () => {
    await enqueueVideoAlgoliaSync('video-id', videoOnlyScope)

    expect(mockedGetJob).toHaveBeenCalledWith('algolia:video-id')
    expect(mockedQueueAdd).toHaveBeenCalledWith(
      jobName,
      { videoId: 'video-id', scope: videoOnlyScope },
      {
        jobId: 'algolia:video-id',
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: { age: 432000, count: 50 }
      }
    )
  })

  it('does not mutate an already-active job, falling through to add()', async () => {
    // An active job has already been read by a worker, so updateData() would
    // not reach it. BullMQ dedups the add() away while that job's key exists —
    // the residual window VMT-320's durable dirty-state closes.
    const activeJob = fakeJob({ videoId: 'video-id', scope: videoOnlyScope })
    mockedGetJob.mockResolvedValueOnce(activeJob)

    await enqueueVideoAlgoliaSync('video-id', videoOnlyScope)

    expect(activeJob.updateData).not.toHaveBeenCalled()
    expect(mockedQueueAdd).toHaveBeenCalledWith(
      jobName,
      { videoId: 'video-id', scope: videoOnlyScope },
      expect.objectContaining({ jobId: 'algolia:video-id' })
    )
  })

  it('unions the scope into an already-queued waiting job instead of dropping it', async () => {
    const existingScope = {
      syncVideoRecord: true,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: ['variant-1'],
      deletedVariantIds: []
    }
    const waitingJob = fakeJob(
      { videoId: 'video-id', scope: existingScope },
      { isWaiting: true }
    )
    mockedGetJob.mockResolvedValueOnce(waitingJob)

    await enqueueVideoAlgoliaSync('video-id', {
      syncVideoRecord: false,
      syncAllVariants: false,
      syncPublishedFlag: true,
      dirtyVariantIds: ['variant-2'],
      deletedVariantIds: []
    })

    expect(waitingJob.updateData).toHaveBeenCalledWith({
      videoId: 'video-id',
      scope: {
        syncVideoRecord: true,
        syncAllVariants: false,
        syncPublishedFlag: true,
        dirtyVariantIds: ['variant-1', 'variant-2'],
        deletedVariantIds: []
      }
    })
    expect(mockedQueueAdd).not.toHaveBeenCalled()
  })

  it('unions the scope into an already-queued delayed (mid-backoff) job', async () => {
    const delayedJob = fakeJob(
      { videoId: 'video-id', scope: videoOnlyScope },
      { isDelayed: true }
    )
    mockedGetJob.mockResolvedValueOnce(delayedJob)

    await enqueueVideoAlgoliaSync('video-id', {
      syncVideoRecord: false,
      syncAllVariants: false,
      syncPublishedFlag: false,
      dirtyVariantIds: [],
      deletedVariantIds: ['variant-3']
    })

    expect(delayedJob.updateData).toHaveBeenCalledWith({
      videoId: 'video-id',
      scope: {
        syncVideoRecord: true,
        syncAllVariants: false,
        syncPublishedFlag: false,
        dirtyVariantIds: [],
        deletedVariantIds: ['variant-3']
      }
    })
    expect(mockedQueueAdd).not.toHaveBeenCalled()
  })

  it('re-drives a retained failed job instead of letting its key block the add', async () => {
    // removeOnFail retains an exhausted job's Redis hash for five days, and
    // BullMQ no-ops add() while a hash for that jobId exists — so without
    // clearing it every later publish of this video would be dropped.
    const failedJob = fakeJob(
      {
        videoId: 'video-id',
        scope: {
          syncVideoRecord: true,
          syncAllVariants: false,
          syncPublishedFlag: false,
          dirtyVariantIds: ['variant-1'],
          deletedVariantIds: []
        }
      },
      { isFailed: true }
    )
    mockedGetJob.mockResolvedValueOnce(failedJob)

    await enqueueVideoAlgoliaSync('video-id', {
      syncVideoRecord: false,
      syncAllVariants: false,
      syncPublishedFlag: true,
      dirtyVariantIds: ['variant-2'],
      deletedVariantIds: []
    })

    expect(failedJob.remove).toHaveBeenCalled()
    // the failed job's scope is carried forward, not lost with the job
    expect(mockedQueueAdd).toHaveBeenCalledWith(
      jobName,
      {
        videoId: 'video-id',
        scope: {
          syncVideoRecord: true,
          syncAllVariants: false,
          syncPublishedFlag: true,
          dirtyVariantIds: ['variant-1', 'variant-2'],
          deletedVariantIds: []
        }
      },
      expect.objectContaining({
        jobId: 'algolia:video-id',
        attempts: 5
      })
    )
  })

  it('logs and swallows a failed enqueue instead of throwing', async () => {
    mockedQueueAdd.mockRejectedValueOnce(new Error('Redis unavailable'))

    await expect(
      enqueueVideoAlgoliaSync('video-id', videoOnlyScope, mockLogger)
    ).resolves.toBeUndefined()

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to enqueue algolia sync for video video-id'
    )
  })

  it('logs and swallows a failed updateData instead of throwing', async () => {
    const waitingJob = fakeJob(
      { videoId: 'video-id', scope: videoOnlyScope },
      { isWaiting: true }
    )
    vi.mocked(waitingJob.updateData).mockRejectedValueOnce(
      new Error('job already completed')
    )
    mockedGetJob.mockResolvedValueOnce(waitingJob)

    await expect(
      enqueueVideoAlgoliaSync('video-id', videoOnlyScope, mockLogger)
    ).resolves.toBeUndefined()

    expect(mockLogger.error).toHaveBeenCalledWith(
      expect.any(Error),
      'failed to enqueue algolia sync for video video-id'
    )
  })
})

describe('mergeScope', () => {
  it('ORs booleans and unions id arrays, deduping', () => {
    const merged = mergeScope(
      {
        syncVideoRecord: true,
        syncAllVariants: false,
        syncPublishedFlag: false,
        dirtyVariantIds: ['a', 'b'],
        deletedVariantIds: ['x']
      },
      {
        syncVideoRecord: false,
        syncAllVariants: true,
        syncPublishedFlag: false,
        dirtyVariantIds: ['b', 'c'],
        deletedVariantIds: ['y']
      }
    )

    expect(merged).toEqual({
      syncVideoRecord: true,
      syncAllVariants: true,
      syncPublishedFlag: false,
      dirtyVariantIds: ['a', 'b', 'c'],
      deletedVariantIds: ['x', 'y']
    })
  })
})
