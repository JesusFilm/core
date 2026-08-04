import { Logger } from 'pino'

import { jobName } from './config'
import { queue } from './queue'
import { VideoAlgoliaSyncJobData, VideoAlgoliaSyncScope } from './types'

const FIVE_DAYS = 5 * 24 * 60 * 60

export const videoOnlyScope: VideoAlgoliaSyncScope = {
  syncVideoRecord: true,
  syncAllVariants: false,
  syncPublishedFlag: false,
  dirtyVariantIds: [],
  deletedVariantIds: []
}

// Enqueues durable, retriable Algolia indexing work for a video. Errors from
// the enqueue itself (e.g. Redis unavailable) are logged and swallowed here
// rather than propagated, so a queueing blip never fails the publish
// mutation that triggered it — mirrors how the direct Algolia calls this
// replaces were already treated as best-effort at every call site.
export async function enqueueVideoAlgoliaSync(
  videoId: string,
  scope: VideoAlgoliaSyncScope,
  logger?: Logger
): Promise<void> {
  try {
    await queue.add(
      jobName,
      { videoId, scope } satisfies VideoAlgoliaSyncJobData,
      {
        jobId: `algolia:${videoId}`,
        attempts: 5,
        backoff: { type: 'exponential', delay: 2000 },
        removeOnComplete: true,
        removeOnFail: { age: FIVE_DAYS, count: 50 }
      }
    )
  } catch (error) {
    logger?.error(error, `failed to enqueue algolia sync for video ${videoId}`)
  }
}
