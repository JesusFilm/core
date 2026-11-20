import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import { youtubeAnalyticsCutoff } from '../../../schema/youtubeChannelAnalytics/retention'
import { logger as defaultLogger } from '../../lib/logger'

/**
 * Deletes stored YouTube Analytics figures fetched more than 28 days ago,
 * two days inside the 30 that YouTube API Services policy allows. Reads already skip them, so a missed night
 * never serves a stale figure; this keeps them from staying in the database.
 */
export async function service(logger: Logger = defaultLogger): Promise<void> {
  const cutoff = youtubeAnalyticsCutoff(new Date())
  const { count } = await prisma.youtubeChannelAnalyticsDay.deleteMany({
    where: { fetchedAt: { lte: cutoff } }
  })
  logger.info(
    { deleted: count, cutoff: cutoff.toISOString() },
    'deleted YouTube Analytics days past the 28-day clock'
  )
}
