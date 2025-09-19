import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

interface E2eCleanupJob {
  __typename: 'e2eCleanup'
  olderThanHours?: number
  dryRun?: boolean
}

const DEFAULT_CLEANUP_HOURS = 24

/**
 * E2E Cleanup Service
 *
 * This service cleans up test data created during e2e tests.
 * It identifies test data by actual patterns used in journeys-admin-e2e tests:
 * - Journeys: "First journey", "Second journey", "Renamed journey" + numbers
 * - Teams: "Automation TeamName" + timestamps, "Renamed Team" + numbers
 * - Invitations with test email patterns like "playwright123@example.com"
 * - Data older than specified hours (default: 24 hours)
 * - Journeys created by users with playwright*@example.com email addresses
 */
export async function service(
  job: Job<E2eCleanupJob>,
  logger?: Logger
): Promise<void> {
  const { olderThanHours = DEFAULT_CLEANUP_HOURS, dryRun = false } = job.data

  logger?.info({ olderThanHours, dryRun }, 'Starting e2e cleanup')

  const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)
  let deletedCount = 0

  try {
    const playwrightUsers = await prismaUsers.user.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        },
        AND: [
          {
            email: {
              startsWith: 'playwright',
              mode: 'insensitive'
            }
          },
          {
            email: {
              endsWith: '@example.com'
            }
          }
        ]
      },
      select: {
        id: true,
        userId: true,
        email: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    logger?.info(`Found ${playwrightUsers.length} playwright users`)

    logger?.info('🔍 Finding playwright users...')
    for (const user of playwrightUsers) {
      // get all journeys older than 48 hours that the user owns
      logger?.info(`🔍 Finding journeys for user ${user.email}...`)
      const journeys = await prisma.journey.findMany({
        where: {
          userJourneys: {
            some: {
              AND: [{ role: UserJourneyRole.owner }, { userId: user.userId }]
            }
          }
        }
      })

      logger?.info(
        `Found ${journeys.length} total test journeys for user ${user.email}`
      )

      if (dryRun) {
        logger?.info('DRY RUN: Would delete the following journeys:')
        journeys.forEach((journey) => {
          logger?.info(`Journey: "${journey.title}" (${journey.id})`)
        })
        return
      }

      // 3. Delete journeys one at a time

      for (const journey of journeys) {
        logger?.info(`🗑️ Deleting journey "${journey.title}" (${journey.id})`)

        try {
          await prisma.$transaction(
            async (tx) => {
              // Delete events first (don't cascade from journey deletion)
              await tx.event.deleteMany({
                where: { journeyId: journey.id }
              })

              // Delete the journey - this will cascade delete everything else
              await tx.journey.delete({
                where: { id: journey.id }
              })
            },
            {
              timeout: 30000 // 30 seconds per journey
            }
          )

          deletedCount++
          logger?.info(`✅ Deleted journey "${journey.title}" (${journey.id})`)
        } catch (error) {
          logger?.warn(
            { journeyId: journey.id, error },
            `Failed to delete journey "${journey.title}"`
          )
        }
      }

      // 4. Delete User
      logger?.info(`🗑️ Deleting user ${user.email}`)
      await prismaUsers.user.delete({
        where: { id: user.id }
      })
      logger?.info(`✅ Deleted user ${user.email}`)
    }

    logger?.info(`Successfully deleted ${deletedCount} test journeys`)
    logger?.info('E2E cleanup completed successfully')
  } catch (error) {
    logger?.error({ error }, 'E2E cleanup failed')
    throw error
  }
}
