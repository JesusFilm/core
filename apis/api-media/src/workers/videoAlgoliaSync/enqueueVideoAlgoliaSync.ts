import { Job } from 'bullmq'
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

// Unions two scopes for the same video: booleans OR together, id arrays
// union (deduped). Used to fold a newly-requested scope into an
// already-queued, not-yet-started job instead of dropping it.
export function mergeScope(
  existing: VideoAlgoliaSyncScope,
  incoming: VideoAlgoliaSyncScope
): VideoAlgoliaSyncScope {
  return {
    syncVideoRecord: existing.syncVideoRecord || incoming.syncVideoRecord,
    syncAllVariants: existing.syncAllVariants || incoming.syncAllVariants,
    syncPublishedFlag:
      existing.syncPublishedFlag || incoming.syncPublishedFlag,
    dirtyVariantIds: Array.from(
      new Set([...existing.dirtyVariantIds, ...incoming.dirtyVariantIds])
    ),
    deletedVariantIds: Array.from(
      new Set([...existing.deletedVariantIds, ...incoming.deletedVariantIds])
    )
  }
}

// Enqueues durable, retriable Algolia indexing work for a video, keyed by a
// per-video jobId so redundant enqueues coalesce. BullMQ's default dedup
// silently drops a second add() for an already-queued jobId — including its
// scope — so a wider sync requested while a narrower one is still pending
// would be lost. To avoid that, a still-waiting (or delayed, e.g. mid
// backoff) job's scope is unioned in via updateData() instead of being
// dropped. A job that's already active (a worker has it and already read
// its data), or doesn't exist, falls back to a normal add() — same
// best-effort behaviour as before for that narrower window. Fully closing
// that residual gap needs a persisted source of truth outside the queue;
// VMT-320 tracks that as a durable dirty-state table.
//
// Errors anywhere in this (e.g. Redis unavailable) are logged and swallowed
// rather than propagated, so a queueing blip never fails the publish
// mutation that triggered it — mirrors how the direct Algolia calls this
// replaces were already treated as best-effort at every call site.
export async function enqueueVideoAlgoliaSync(
  videoId: string,
  scope: VideoAlgoliaSyncScope,
  logger?: Logger
): Promise<void> {
  const jobId = `algolia:${videoId}`

  try {
    const existingJob = (await queue.getJob(jobId)) as
      | Job<VideoAlgoliaSyncJobData>
      | undefined

    if (
      existingJob != null &&
      ((await existingJob.isWaiting()) || (await existingJob.isDelayed()))
    ) {
      await existingJob.updateData({
        videoId,
        scope: mergeScope(existingJob.data.scope, scope)
      } satisfies VideoAlgoliaSyncJobData)
      return
    }

    await queue.add(
      jobName,
      { videoId, scope } satisfies VideoAlgoliaSyncJobData,
      {
        jobId,
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
