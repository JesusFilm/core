import { Queue } from 'bullmq'

import { deleteShortLink } from '../../schema/qrCode/qrCode.service'
import { connection } from '../lib/connection'
import { logger } from '../lib/logger'

import { jobName, queueName } from './config'
import type { ShortLinkDeleteJob } from './service'

const ONE_DAY = 86_400

export const queue = new Queue<ShortLinkDeleteJob>(queueName, { connection })

/**
 * Queue the delete of api-media short links whose QR rows are already gone,
 * one retried job per id; call it once the transaction that deleted the rows
 * has committed. The job id is per short link, so enqueueing an id twice
 * queues it once. Failed jobs are kept a day as the record of what failed.
 * Should the queue itself be unreachable, the link is deleted directly and a
 * failure is logged. Never throws.
 */
export async function enqueueShortLinkDeletes(
  shortLinkIds: string[]
): Promise<void> {
  await Promise.all(
    shortLinkIds.map(async (shortLinkId) => {
      try {
        await queue.add(
          jobName,
          { shortLinkId },
          {
            jobId: `shortlink-delete-${shortLinkId}`,
            attempts: 5,
            backoff: { type: 'exponential', delay: 5000 },
            removeOnComplete: true,
            removeOnFail: { age: ONE_DAY }
          }
        )
      } catch (queueError) {
        logger.error(
          { error: queueError, shortLinkId },
          'short link delete enqueue failed; deleting directly'
        )
        try {
          await deleteShortLink(shortLinkId)
        } catch (error) {
          logger.error({ error, shortLinkId }, 'short link delete failed')
        }
      }
    })
  )
}
