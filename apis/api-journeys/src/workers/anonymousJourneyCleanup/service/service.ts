import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

import {
  createJourneyPermissionCoordinator,
  journeyPermissionsEnvironment
} from '../../../lib/mcpPermissions'
import { findJourneyShortLinkIds } from '../../shortlinkDelete/findJourneyShortLinkIds'
import { enqueueShortLinkDeletes } from '../../shortlinkDelete/queue'

import { collectMediaFromJourneys, deleteUnusedMedia } from './mediaCleanup'

const CLEANUP_DAYS = 5

export async function service(job: Job, logger?: Logger): Promise<void> {
  logger?.info('Starting anonymous journey cleanup')
  const permissionConfig = journeyPermissionsEnvironment(process.env)
  const permissions = permissionConfig
    ? createJourneyPermissionCoordinator(permissionConfig, prisma, logger)
    : undefined
  if (permissions) permissions.pending(await permissions.reconcile())

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
      const mediaRefs = permissions
        ? {
            muxVideoIds: new Set<string>(),
            cloudflareImageIds: new Set<string>()
          }
        : await collectMediaFromJourneys(journeyIds)

      const deletedJourneyIds: string[] = []
      for (const journey of journeys) {
        try {
          if (permissions)
            await permissions.runAnonymousCleanup({
              kind: 'journey',
              id: journey.id,
              userId: user.userId,
              cutoffDate: cutoffDate.toISOString()
            })
          else {
            // Preserve the original cleanup path when coordination is unconfigured.
            const shortLinkIds = await findJourneyShortLinkIds([journey.id])
            await prisma.journey.delete({ where: { id: journey.id } })
            await enqueueShortLinkDeletes(shortLinkIds)
          }
          deletedJourneyCount++
          deletedJourneyIds.push(journey.id)
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

      if (
        deletedJourneyIds.length > 0 &&
        (mediaRefs.muxVideoIds.size > 0 ||
          mediaRefs.cloudflareImageIds.size > 0)
      ) {
        const { deletedMuxVideos, deletedCloudflareImages } =
          await deleteUnusedMedia(
            mediaRefs,
            deletedJourneyIds,
            user.userId,
            logger
          )
        deletedMuxVideoCount += deletedMuxVideos
        deletedCloudflareImageCount += deletedCloudflareImages
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

          const removeMemberships = () =>
            prisma.userTeam.deleteMany({
              where: { userId: user.userId }
            })
          const { count: deletedUserTeams } = permissions
            ? await permissions.runAnonymousCleanup({
                kind: 'memberships',
                id: user.userId,
                userId: user.userId,
                cutoffDate: cutoffDate.toISOString()
              })
            : await removeMemberships()
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
              if (permissions)
                await permissions.runAnonymousCleanup({
                  kind: 'team',
                  id: teamId,
                  userId: user.userId,
                  cutoffDate: cutoffDate.toISOString()
                })
              else await prisma.team.delete({ where: { id: teamId } })
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
