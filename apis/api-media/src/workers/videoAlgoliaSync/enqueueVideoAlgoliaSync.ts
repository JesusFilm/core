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
    syncPublishedFlag: existing.syncPublishedFlag || incoming.syncPublishedFlag,
    dirtyVariantIds: Array.from(
      new Set([...existing.dirtyVariantIds, ...incoming.dirtyVariantIds])
    ),
    deletedVariantIds: Array.from(
      new Set([...existing.deletedVariantIds, ...incoming.deletedVariantIds])
    )
  }
}

// Enqueues durable, retriable Algolia indexing work for a video, keyed by a
// per-video jobId so redundant enqueues coalesce.
//
// BullMQ keys a job's Redis hash on its jobId and treats add() for an id that
// still EXISTS as a no-op (see addStandardJob's handleDuplicatedJob) — the new
// payload, and therefore the new scope, is silently discarded. That makes the
// state of any already-present job decide what we have to do:
//
//   waiting / delayed (mid-backoff) — the job hasn't been read by a worker
//     yet, so union the new scope into it via updateData().
//   failed — attempts are exhausted but removeOnFail retains the hash for
//     FIVE_DAYS, so a plain add() would be a no-op and every subsequent
//     publish of this video would be dropped for days. That is exactly the
//     QA-543 symptom, aimed at the videos already known to be failing, so
//     carry the failed job's scope forward, drop the stale job, and re-add
//     with a full attempt budget.
//   active — a worker already holds the job and has read its data. add() is a
//     no-op here too, so a scope requested during that window is still lost.
//     The window is one job execution rather than days, and closing it
//     properly needs a source of truth that outlives the queue: VMT-320
//     tracks that as a durable dirty-state table.
//
// Errors anywhere in this (e.g. Redis unavailable) are logged and swallowed
// rather than propagated, so a queueing blip never fails the publish mutation
// that triggered it — mirrors how the direct Algolia calls this replaces were
// already treated as best-effort at every call site. Note that swallowing
// still loses the sync, because the failure happens before BullMQ has a job to
// retry. Making the intent survive that requires persisting it in the same
// transaction as the mutation (a transactional outbox), which is the durable
// dirty-state VMT-320 introduces; a rethrow here would only fail the mutation
// after its data has already been committed, without making the sync durable.
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

    let scopeToEnqueue = scope

    if (existingJob != null) {
      const [isWaiting, isDelayed, isFailed] = await Promise.all([
        existingJob.isWaiting(),
        existingJob.isDelayed(),
        existingJob.isFailed()
      ])

      if (isWaiting || isDelayed) {
        await existingJob.updateData({
          videoId,
          scope: mergeScope(existingJob.data.scope, scope)
        } satisfies VideoAlgoliaSyncJobData)
        return
      }

      if (isFailed) {
        scopeToEnqueue = mergeScope(existingJob.data.scope, scope)
        await existingJob.remove()
      }
    }

    await queue.add(
      jobName,
      { videoId, scope: scopeToEnqueue } satisfies VideoAlgoliaSyncJobData,
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
