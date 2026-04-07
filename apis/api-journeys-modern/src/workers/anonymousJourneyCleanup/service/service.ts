import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

import { collectMediaFromJourneys, deleteUnusedMedia } from './mediaCleanup'

const CLEANUP_DAYS = 5

export async function service(job: Job, logger?: Logger): Promise<void> {
  logger?.info('Starting anonymous journey cleanup')

  const cutoffDate = new Date(Date.now() - CLEANUP_DAYS * 24 * 60 * 60 * 1000)
  let deletedJourneyCount = 0
  let deletedUserCount = 0
  let deletedMuxVideoCount = 0
  let deletedCloudflareImageCount = 0

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

      const journeyIds = journeys.map((j) => j.id)

      const mediaRefs = await collectMediaFromJourneys(journeyIds)
      if (mediaRefs.muxVideoIds.size > 0 || mediaRefs.cloudflareImageIds.size > 0) {
        const { deletedMuxVideos, deletedCloudflareImages } =
          await deleteUnusedMedia(mediaRefs, journeyIds, user.userId, logger)
        deletedMuxVideoCount += deletedMuxVideos
        deletedCloudflareImageCount += deletedCloudflareImages
      }

      for (const journey of journeys) {
        try {
          await prisma.journey.delete({ where: { id: journey.id } })
          deletedJourneyCount++
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

      const remainingJourneys = await prisma.journey.count({
        where: {
          userJourneys: {
            some: {
              userId: user.userId,
              role: UserJourneyRole.owner
            }
          }
        }
      })

      if (remainingJourneys === 0) {
        try {
          const userTeams = await prisma.userTeam.findMany({
            where: { userId: user.userId },
            select: { teamId: true }
          })
          const teamIds = userTeams.map((ut) => ut.teamId)

          const { count: deletedUserTeams } = await prisma.userTeam.deleteMany({
            where: { userId: user.userId }
          })
          if (deletedUserTeams > 0) {
            logger?.info(
              { userId: user.userId, deletedUserTeams },
              `Deleted ${deletedUserTeams} userTeam(s) for anonymous user`
            )
          }

          for (const teamId of teamIds) {
            const remainingMembers = await prisma.userTeam.count({
              where: { teamId }
            })
            if (remainingMembers === 0) {
              await prisma.team.delete({ where: { id: teamId } })
              logger?.info({ teamId }, 'Deleted empty team')
            }
          }
          await prismaUsers.user.delete({ where: { id: user.id } })
          deletedUserCount++
          logger?.info(
            { userId: user.userId },
            'Deleted anonymous user with no remaining journeys'
          )
        } catch (error) {
          logger?.warn(
            { userId: user.userId, error },
            'Failed to delete anonymous user'
          )
        }
      }
    }

    logger?.info(
      {
        deletedJourneyCount,
        deletedUserCount,
        deletedMuxVideoCount,
        deletedCloudflareImageCount
      },
      `Anonymous journey cleanup completed: deleted ${deletedJourneyCount} journeys, ${deletedUserCount} users, ${deletedMuxVideoCount} Mux videos, ${deletedCloudflareImageCount} Cloudflare images`
    )
  } catch (error) {
    logger?.error({ error }, 'Anonymous journey cleanup failed')
    throw error
  }
}
