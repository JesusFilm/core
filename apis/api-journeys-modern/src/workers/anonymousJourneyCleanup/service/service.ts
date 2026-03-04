import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

const CLEANUP_DAYS = 5

export async function service(job: Job, logger?: Logger): Promise<void> {
  logger?.info('Starting anonymous journey cleanup')

  const cutoffDate = new Date(Date.now() - CLEANUP_DAYS * 24 * 60 * 60 * 1000)
  let deletedCount = 0

  try {
    const anonymousUsers = await prismaUsers.user.findMany({
      where: { email: null },
      select: { id: true, userId: true }
    })

    if (anonymousUsers.length === 0) {
      logger?.info('No anonymous users found')
      return
    }

    logger?.info(`Found ${anonymousUsers.length} anonymous users`)

    for (const user of anonymousUsers) {
      const journeys = await prisma.journey.findMany({
        where: {
          createdAt: { lt: cutoffDate },
          userJourneys: {
            some: {
              userId: user.userId,
              role: UserJourneyRole.owner
            }
          }
        },
        select: { id: true, title: true }
      })

      if (journeys.length === 0) continue

      logger?.info(
        { userId: user.userId },
        `Found ${journeys.length} journeys older than ${CLEANUP_DAYS} days`
      )

      for (const journey of journeys) {
        try {
          await prisma.journey.delete({ where: { id: journey.id } })
          deletedCount++
          logger?.info(
            { journeyId: journey.id },
            `Deleted journey "${journey.title}"`
          )
        } catch (error) {
          logger?.warn(
            { journeyId: journey.id, error },
            `Failed to delete journey "${journey.title}"`
          )
        }
      }
    }

    logger?.info(
      { deletedCount },
      `Anonymous journey cleanup completed: deleted ${deletedCount} journeys`
    )
  } catch (error) {
    logger?.error({ error }, 'Anonymous journey cleanup failed')
    throw error
  }
}
