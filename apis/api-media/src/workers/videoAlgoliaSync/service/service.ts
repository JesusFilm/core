import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import {
  updateVideoInAlgolia,
  updateVideoPublishedStatus
} from '../../../lib/algolia/algoliaVideoUpdate'
import { updateVideoVariantInAlgolia } from '../../../lib/algolia/algoliaVideoVariantUpdate'
import { VideoAlgoliaSyncJobData } from '../types'

// Re-derives what to write from current DB state rather than trusting the
// job payload for anything beyond videoId/scope, so a retried job always
// reflects the latest truth. Any Algolia failure below propagates (the
// helpers throw) so BullMQ fails the job and retries it.
export async function service(
  job: Job<VideoAlgoliaSyncJobData>,
  logger?: Logger
): Promise<void> {
  const { videoId, scope } = job.data

  const variantIdsToDelete = new Set(scope.deletedVariantIds)
  for (const variantId of variantIdsToDelete) {
    await updateVideoVariantInAlgolia(variantId, logger)
  }

  if (scope.syncVideoRecord) {
    await updateVideoInAlgolia(videoId, logger)
  }

  if (scope.syncAllVariants) {
    const variants = await prisma.videoVariant.findMany({
      where: { videoId },
      select: { id: true }
    })
    for (const variant of variants) {
      await updateVideoVariantInAlgolia(variant.id, logger)
    }
    return
  }

  if (scope.syncPublishedFlag) {
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      select: { published: true }
    })
    if (video != null) {
      await updateVideoPublishedStatus(
        videoId,
        video.published ?? false,
        logger
      )
    }
  }

  for (const variantId of scope.dirtyVariantIds) {
    if (variantIdsToDelete.has(variantId)) continue
    await updateVideoVariantInAlgolia(variantId, logger)
  }
}
