import { Job } from 'bullmq'
import { Logger } from 'pino'

import { UserJourneyRole, prisma } from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'

import {
  collectMediaFromJourneys,
  deleteUnusedMedia
} from '../../../lib/mediaCleanup/mediaCleanup'
import {
  deleteQrCodes,
  deleteShortLinks,
  findRegionQrCodes
} from '../../../schema/campaign/regionLanguage/service'
import { findJourneyShortLinkIds } from '../../shortlinkDelete/findJourneyShortLinkIds'
import { enqueueShortLinkDeletes } from '../../shortlinkDelete/queue'

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
 * - Campaigns titled "Playwright campaign" or "Playwright editor v2 campaign"
 *   + a timestamp, with their Campaign QR Codes and short links
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

      const journeyIds = journeys.map((j) => j.id)
      const mediaRefs = await collectMediaFromJourneys(journeyIds)

      const deletedJourneyIds: string[] = []
      for (const journey of journeys) {
        try {
          // Its QR rows cascade with it; their short links go once it is gone.
          const shortLinkIds = await findJourneyShortLinkIds([journey.id])
          await prisma.journey.delete({ where: { id: journey.id } })
          await enqueueShortLinkDeletes(shortLinkIds)
          deletedCount++
          deletedJourneyIds.push(journey.id)
          logger?.info(`Deleted journey "${journey.title}" (${journey.id})`)
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
        logger?.info(
          { deletedMuxVideos, deletedCloudflareImages },
          `Cleaned up ${deletedMuxVideos} Mux videos and ${deletedCloudflareImages} Cloudflare images`
        )
      }

      // 4. Delete User
      logger?.info(`🗑️ Deleting user ${user.email}`)
      await prismaUsers.user.delete({
        where: { id: user.id }
      })
      logger?.info(`✅ Deleted user ${user.email}`)
    }

    logger?.info(`Successfully deleted ${deletedCount} test journeys`)

    const deletedCampaignCount = await deleteLeftoverCampaigns(
      cutoffDate,
      dryRun,
      logger
    )
    logger?.info(`Successfully deleted ${deletedCampaignCount} test campaigns`)
    logger?.info('E2E cleanup completed successfully')
  } catch (error) {
    logger?.error({ error }, 'E2E cleanup failed')
    throw error
  }
}

const PLAYWRIGHT_CAMPAIGN_TITLE_PREFIXES = [
  'Playwright campaign',
  'Playwright editor v2 campaign'
]

/**
 * Delete the campaigns the campaign builder e2e specs leave behind when a run
 * fails before its own cleanup, in the order of `campaignDelete`: the Campaign
 * QR Codes go inside the transaction with the campaign, and their short links
 * are queued for delete once it has committed. Returns the number deleted.
 */
async function deleteLeftoverCampaigns(
  cutoffDate: Date,
  dryRun: boolean,
  logger?: Logger
): Promise<number> {
  const campaigns = await prisma.campaign.findMany({
    where: {
      createdAt: { lt: cutoffDate },
      OR: PLAYWRIGHT_CAMPAIGN_TITLE_PREFIXES.map((prefix) => ({
        title: { startsWith: prefix }
      }))
    },
    select: { id: true, title: true }
  })

  logger?.info(`Found ${campaigns.length} test campaigns`)

  if (dryRun) {
    logger?.info('DRY RUN: Would delete the following campaigns:')
    campaigns.forEach((campaign) => {
      logger?.info(`Campaign: "${campaign.title}" (${campaign.id})`)
    })
    return 0
  }

  let deletedCount = 0
  for (const campaign of campaigns) {
    try {
      let shortLinkIds: string[] = []
      await prisma.$transaction(async (tx) => {
        shortLinkIds = await deleteQrCodes(
          tx,
          await findRegionQrCodes(tx, { region: { campaignId: campaign.id } })
        )
        await tx.campaign.delete({ where: { id: campaign.id } })
      })
      await deleteShortLinks(shortLinkIds)
      deletedCount++
      logger?.info(`Deleted campaign "${campaign.title}" (${campaign.id})`)
    } catch (error) {
      logger?.warn(
        { campaignId: campaign.id, error },
        `Failed to delete campaign "${campaign.title}"`
      )
    }
  }
  return deletedCount
}
