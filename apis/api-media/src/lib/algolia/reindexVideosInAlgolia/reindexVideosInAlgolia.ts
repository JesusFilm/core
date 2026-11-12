import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import {
  enqueueVideoAlgoliaSync,
  videoOnlyScope
} from '../../../workers/videoAlgoliaSync'

export const DEFAULT_REINDEX_BATCH_SIZE = 200
const MAX_REINDEX_BATCH_SIZE = 1000

export interface ReindexVideosOptions {
  /** Enqueue the syncs. Without it the run only counts what it would enqueue. */
  apply: boolean
  /** Limit the run to these Video ids. */
  videoIds?: string[]
  /** Resume after this Video id (ids are visited in ascending order). */
  afterVideoId?: string
  batchSize?: number
}

export interface ReindexVideosResult {
  scanned: number
  /** Video ids enqueued for a sync; always 0 for a dry run. */
  enqueued: number
  lastVideoId: string | null
}

export function assertValidReindexBatchSize(batchSize: number): number {
  if (
    !Number.isInteger(batchSize) ||
    batchSize < 1 ||
    batchSize > MAX_REINDEX_BATCH_SIZE
  )
    throw new Error(
      `Invalid batch size: ${batchSize}. Expected an integer from 1 to ${MAX_REINDEX_BATCH_SIZE}.`
    )
  return batchSize
}

/**
 * Re-syncs the Algolia video record for every Video (or the given ids).
 *
 * The indexer writes the whole record with saveObjects, which replaces it, so
 * a change to how a field is derived (such as isDownloadable) only reaches
 * records that are re-synced. This queues one videoAlgoliaSync job per Video
 * with the video-record scope, so the worker does the Algolia writes with its
 * retries, and a repeat run coalesces with jobs that are still queued.
 *
 * enqueueVideoAlgoliaSync logs and swallows a failed enqueue (for example
 * when Redis is unreachable), so the counts here are videos handed to it, not
 * confirmed jobs. Confirm with checkVideoInAlgolia afterwards.
 */
export async function reindexVideosInAlgolia(
  options: ReindexVideosOptions,
  logger?: Logger
): Promise<ReindexVideosResult> {
  const batchSize = assertValidReindexBatchSize(
    options.batchSize ?? DEFAULT_REINDEX_BATCH_SIZE
  )
  let cursor = options.afterVideoId ?? null
  let scanned = 0
  let enqueued = 0

  while (true) {
    const videos = await prisma.video.findMany({
      where: {
        id: {
          ...(options.videoIds != null ? { in: options.videoIds } : {}),
          ...(cursor != null ? { gt: cursor } : {})
        }
      },
      select: { id: true },
      orderBy: { id: 'asc' },
      take: batchSize
    })
    if (videos.length === 0) break

    for (const { id } of videos) {
      if (options.apply) {
        await enqueueVideoAlgoliaSync(id, videoOnlyScope, logger)
        enqueued++
      }
      scanned++
    }

    cursor = videos[videos.length - 1].id
    logger?.info(
      { scanned, enqueued, lastVideoId: cursor },
      'reindex videos progress (resume with --after=<lastVideoId>)'
    )
    if (videos.length < batchSize) break
  }

  return { scanned, enqueued, lastVideoId: cursor }
}
