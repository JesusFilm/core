import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '../../../lib/prisma'

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
 */
export async function service(
  job: Job<E2eCleanupJob>,
  logger?: Logger
): Promise<void> {
  const { olderThanHours = DEFAULT_CLEANUP_HOURS, dryRun = false } = job.data

  logger?.info({ olderThanHours, dryRun }, 'Starting e2e cleanup')

  const cutoffDate = new Date(Date.now() - olderThanHours * 60 * 60 * 1000)

  // Define patterns that indicate test data based on actual e2e test patterns
  const journeyPatterns = [
    'First journey',
    'Second journey',
    'Renamed journey',
    'Test Journey', // generic test pattern
    'E2E',
    'Automation',
    'Playwright'
  ]

  const teamPatterns = [
    'Automation TeamName',
    'Renamed Team',
    'Playwright Test Team', // generic test pattern
    'Test Team',
    'E2E',
    'Automation'
  ]

  // Initialize variables
  let testJourneys: Array<{ id: string; title: string; createdAt: Date }> = []
  let testTeams: Array<{ id: string; title: string; createdAt: Date }> = []
  let testTeamInvites: Array<{ id: string; email: string; createdAt: Date }> =
    []
  let testJourneyInvites: Array<{
    id: string
    email: string
    updatedAt: Date
  }> = []

  try {
    // Find test journeys
    testJourneys = await prisma.journey.findMany({
      where: {
        AND: [
          {
            createdAt: {
              lt: cutoffDate
            }
          },
          {
            OR: journeyPatterns.map((pattern) => ({
              title: {
                contains: pattern,
                mode: 'insensitive'
              }
            }))
          }
        ]
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    // Find test teams
    testTeams = await prisma.team.findMany({
      where: {
        AND: [
          {
            createdAt: {
              lt: cutoffDate
            }
          },
          {
            OR: teamPatterns.map((pattern) => ({
              title: {
                contains: pattern,
                mode: 'insensitive'
              }
            }))
          }
        ]
      },
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    // Find test invitations based on email patterns (playwright emails)
    testTeamInvites = await prisma.userTeamInvite.findMany({
      where: {
        AND: [
          {
            createdAt: {
              lt: cutoffDate
            }
          },
          {
            OR: [
              {
                email: {
                  contains: 'playwright',
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: '@example.com'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        createdAt: true
      }
    })

    testJourneyInvites = await prisma.userInvite.findMany({
      where: {
        AND: [
          {
            updatedAt: {
              lt: cutoffDate
            }
          },
          {
            OR: [
              {
                email: {
                  contains: 'playwright',
                  mode: 'insensitive'
                }
              },
              {
                email: {
                  contains: '@example.com'
                }
              }
            ]
          }
        ]
      },
      select: {
        id: true,
        email: true,
        updatedAt: true
      }
    })

    logger?.info(
      {
        journeysFound: testJourneys.length,
        teamsFound: testTeams.length,
        teamInvitesFound: testTeamInvites.length,
        journeyInvitesFound: testJourneyInvites.length,
        cutoffDate: cutoffDate.toISOString()
      },
      'Found test data to clean up'
    )

    if (dryRun) {
      logger?.info('DRY RUN: Would delete the following test data:')
      testJourneys.forEach((journey) => {
        logger?.info(
          `Journey: ${journey.title} (${journey.id}) - Created: ${journey.createdAt.toISOString()}`
        )
      })
      testTeams.forEach((team) => {
        logger?.info(
          `Team: ${team.title} (${team.id}) - Created: ${team.createdAt.toISOString()}`
        )
      })
      testTeamInvites.forEach((invite) => {
        logger?.info(
          `Team Invite: ${invite.email} (${invite.id}) - Created: ${invite.createdAt.toISOString()}`
        )
      })
      testJourneyInvites.forEach((invite) => {
        logger?.info(
          `Journey Invite: ${invite.email} (${invite.id}) - Updated: ${invite.updatedAt.toISOString()}`
        )
      })
      return
    }

    // Clean up test journeys and related data
    if (testJourneys.length > 0) {
      const journeyIds = testJourneys.map((j) => j.id)

      // Delete related data first due to foreign key constraints
      await prisma.userJourney.deleteMany({
        where: { journeyId: { in: journeyIds } }
      })

      await prisma.journeyVisitor.deleteMany({
        where: { journeyId: { in: journeyIds } }
      })

      await prisma.event.deleteMany({
        where: { journeyId: { in: journeyIds } }
      })

      // Delete blocks associated with journeys
      await prisma.block.deleteMany({
        where: { journeyId: { in: journeyIds } }
      })

      // Delete user invites for these journeys
      await prisma.userInvite.deleteMany({
        where: { journeyId: { in: journeyIds } }
      })

      // Finally delete the journeys
      const deletedJourneys = await prisma.journey.deleteMany({
        where: { id: { in: journeyIds } }
      })

      logger?.info(
        { deletedJourneys: deletedJourneys.count },
        'Deleted test journeys'
      )
    }

    // Clean up test teams and related data
    if (testTeams.length > 0) {
      const teamIds = testTeams.map((t) => t.id)

      // Delete related data first
      await prisma.userTeam.deleteMany({
        where: { teamId: { in: teamIds } }
      })

      await prisma.userTeamInvite.deleteMany({
        where: { teamId: { in: teamIds } }
      })

      // Delete journeys owned by these teams
      const teamJourneys = await prisma.journey.findMany({
        where: { teamId: { in: teamIds } },
        select: { id: true }
      })

      if (teamJourneys.length > 0) {
        const teamJourneyIds = teamJourneys.map((j) => j.id)

        await prisma.userJourney.deleteMany({
          where: { journeyId: { in: teamJourneyIds } }
        })

        await prisma.journeyVisitor.deleteMany({
          where: { journeyId: { in: teamJourneyIds } }
        })

        await prisma.event.deleteMany({
          where: { journeyId: { in: teamJourneyIds } }
        })

        await prisma.block.deleteMany({
          where: { journeyId: { in: teamJourneyIds } }
        })

        await prisma.userInvite.deleteMany({
          where: { journeyId: { in: teamJourneyIds } }
        })

        await prisma.journey.deleteMany({
          where: { id: { in: teamJourneyIds } }
        })
      }

      // Finally delete the teams
      const deletedTeams = await prisma.team.deleteMany({
        where: { id: { in: teamIds } }
      })

      logger?.info({ deletedTeams: deletedTeams.count }, 'Deleted test teams')
    }

    // Clean up test invitations
    if (testTeamInvites.length > 0) {
      const inviteIds = testTeamInvites.map((i) => i.id)
      const deletedTeamInvites = await prisma.userTeamInvite.deleteMany({
        where: { id: { in: inviteIds } }
      })

      logger?.info(
        { deletedTeamInvites: deletedTeamInvites.count },
        'Deleted test team invitations'
      )
    }

    if (testJourneyInvites.length > 0) {
      const inviteIds = testJourneyInvites.map((i) => i.id)
      const deletedJourneyInvites = await prisma.userInvite.deleteMany({
        where: { id: { in: inviteIds } }
      })

      logger?.info(
        { deletedJourneyInvites: deletedJourneyInvites.count },
        'Deleted test journey invitations'
      )
    }

    logger?.info('E2E cleanup completed successfully')
  } catch (error) {
    logger?.error({ error }, 'E2E cleanup failed')
    throw error
  }
}
