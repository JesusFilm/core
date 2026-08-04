import { Logger } from 'pino'
import { vi } from 'vitest'

import { jobName } from './config'
import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from './enqueueVideoAlgoliaSync'
import { queue } from './queue'

const mockedQueueAdd = vi.mocked(queue.add)

const mockLogger = {
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn()
} as unknown as Logger

describe('enqueueVideoAlgoliaSync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('enqueues a durable, per-video-deduped job with the given scope', async () => {
    await enqueueVideoAlgoliaSync('video-id', videoOnlyScope)

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
})
