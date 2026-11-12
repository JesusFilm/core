/**
 * Re-syncs the Algolia video record for every Video, so records written under
 * an older isDownloadable / componentType rule pick up the current one.
 *
 * Dry run by default: it only counts the videos it would queue. Pass --apply
 * to queue a videoAlgoliaSync job per Video; the api-media worker then writes
 * the records. It needs the media database and Redis (REDIS_URL) but not
 * Algolia credentials, and re-running is safe because jobs for the same Video
 * coalesce.
 *
 * Usage:
 *   nx run api-media:reindex-videos-algolia                     # dry run
 *   nx run api-media:reindex-videos-algolia -- --apply
 *   nx run api-media:reindex-videos-algolia -- --apply --video-ids=1_jf-0-0,2_PI
 *   nx run api-media:reindex-videos-algolia -- --apply --after=<lastVideoId>
 *
 * Afterwards, spot-check with the checkVideoInAlgolia query.
 */

import {
  DEFAULT_REINDEX_BATCH_SIZE,
  assertValidReindexBatchSize,
  reindexVideosInAlgolia
} from '../../lib/algolia/reindexVideosInAlgolia/reindexVideosInAlgolia'
import { logger } from '../../logger'
import { queue } from '../../workers/videoAlgoliaSync/queue'

import { hasFlag } from '../cliFlags'

export function getFlagValue(argv: string[], name: string): string | undefined {
  const prefix = `--${name}=`
  return argv.find((arg) => arg.startsWith(prefix))?.slice(prefix.length)
}

export async function main(argv = process.argv): Promise<void> {
  const apply = hasFlag(argv, 'apply')
  const videoIds = getFlagValue(argv, 'video-ids')
    ?.split(',')
    .map((id) => id.trim())
    .filter(Boolean)
  const afterVideoId = getFlagValue(argv, 'after')
  const batchSizeFlag = getFlagValue(argv, 'batch-size')
  const batchSize = assertValidReindexBatchSize(
    batchSizeFlag != null
      ? Number(batchSizeFlag)
      : DEFAULT_REINDEX_BATCH_SIZE
  )

  logger.info(
    { apply, videoIds, afterVideoId, batchSize },
    apply
      ? 'queueing algolia video syncs'
      : 'dry run: pass --apply to queue algolia video syncs'
  )

  const result = await reindexVideosInAlgolia(
    { apply, videoIds, afterVideoId, batchSize },
    logger
  )

  logger.info(
    result,
    apply
      ? 'queued algolia video syncs; the worker will write the records'
      : 'dry run complete; nothing was queued'
  )
}

if (require.main === module) {
  main()
    // The BullMQ queue holds a Redis connection open, so close it and exit.
    .then(async () => {
      await queue.close()
      process.exit(0)
    })
    .catch((error) => {
      logger.error(error, 'failed to queue algolia video syncs')
      process.exit(1)
    })
}
