import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Job } from 'bullmq'
import { graphql } from 'gql.tada'
import { Logger } from 'pino'

import { UserJourneyRole } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../lib/prisma'

interface E2eCleanupJob {
  __typename: 'e2eCleanup'
  olderThanHours?: number
  dryRun?: boolean
}

const DEFAULT_CLEANUP_HOURS = 24

// Apollo Client setup for user queries
const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const GET_USER = graphql(`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      email
      firstName
      imageUrl
    }
  }
`)

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

  // Define patterns that indicate test data based on actual e2e test patterns
  const journeyPatterns = ['First journey', 'Second journey', 'Renamed journey']

  const teamPatterns = ['Automation TeamName', 'Renamed Team']

  // Helper function to check if user email matches playwright pattern
  const playwrightUserCache = new Map<string, boolean>()

  async function isPlaywrightUser(userId: string): Promise<boolean> {
    // Check cache first
    if (playwrightUserCache.has(userId)) {
      return playwrightUserCache.get(userId)!
    }

    try {
      const { data } = await apollo.query({
        query: GET_USER,
        variables: { userId }
      })

      const email = data?.user?.email
      if (!email) {
        playwrightUserCache.set(userId, false)
        return false
      }

      const isPlaywright =
        email.toLowerCase().includes('playwright') &&
        email.includes('@example.com')
      playwrightUserCache.set(userId, isPlaywright)
      return isPlaywright
    } catch (error) {
      logger?.warn({ userId, error }, 'Failed to fetch user email')
      playwrightUserCache.set(userId, false)
      return false
    }
  }

  // Initialize variables
  const testJourneys: Array<{ id: string; title: string; createdAt: Date }> = []
  let testTeams: Array<{ id: string; title: string; createdAt: Date }> = []
  let testTeamInvites: Array<{ id: string; email: string; createdAt: Date }> =
    []
  let testJourneyInvites: Array<{
    id: string
    email: string
    updatedAt: Date
  }> = []

  try {
    // Find all journeys older than cutoff date that could be test journeys
    const candidateJourneys = await prisma.journey.findMany({
      where: {
        createdAt: {
          lt: cutoffDate
        }
      },
      include: {
        userJourneys: {
          where: {
            role: UserJourneyRole.owner
          }
        }
      }
    })

    // Filter journeys by title patterns OR owner emails
    let journeysByTitle = 0
    let journeysByPlaywrightUser = 0

    for (const journey of candidateJourneys) {
      const owners = journey.userJourneys.filter(
        (uj) => uj.role === UserJourneyRole.owner
      )

      let isTestJourney = false
      let reason = ''

      // Check if journey matches title patterns
      const matchesTitle = journeyPatterns.some((pattern) =>
        journey.title.toLowerCase().includes(pattern.toLowerCase())
      )

      if (matchesTitle) {
        isTestJourney = true
        reason = 'title pattern'
        journeysByTitle++
      } else {
        // Check if any owner has a playwright email
        for (const owner of owners) {
          if (await isPlaywrightUser(owner.userId)) {
            isTestJourney = true
            reason = 'playwright user owner'
            journeysByPlaywrightUser++
            break
          }
        }
      }

      if (isTestJourney) {
        if (dryRun) {
          logger?.debug(
            `Adding journey "${journey.title}" (${journey.id}) - Reason: ${reason}`
          )
        }
        testJourneys.push({
          id: journey.id,
          title: journey.title,
          createdAt: journey.createdAt
        })
      }
    }

    if (dryRun) {
      logger?.info(
        {
          totalCandidates: candidateJourneys.length,
          journeysByTitle,
          journeysByPlaywrightUser,
          totalSelected: testJourneys.length,
          uniqueUsersChecked: playwrightUserCache.size,
          playwrightUsersFound: Array.from(playwrightUserCache.values()).filter(
            Boolean
          ).length
        },
        'Journey filtering completed'
      )
    }

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

    if (dryRun) {
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
    }

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

    // Wrap all cleanup operations in a single transaction for atomicity
    const results = await prisma.$transaction(async (tx) => {
      let deletedJourneysCount = 0
      let deletedTeamsCount = 0
      let deletedTeamInvitesCount = 0
      let deletedJourneyInvitesCount = 0

      // Clean up test journeys and related data
      if (testJourneys.length > 0) {
        const journeyIds = testJourneys.map((j) => j.id)

        // Delete related data first due to foreign key constraints
        await tx.userJourney.deleteMany({
          where: { journeyId: { in: journeyIds } }
        })

        await tx.journeyVisitor.deleteMany({
          where: { journeyId: { in: journeyIds } }
        })

        await tx.event.deleteMany({
          where: { journeyId: { in: journeyIds } }
        })

        // Delete blocks associated with journeys
        await tx.block.deleteMany({
          where: { journeyId: { in: journeyIds } }
        })

        // Delete user invites for these journeys
        await tx.userInvite.deleteMany({
          where: { journeyId: { in: journeyIds } }
        })

        // Finally delete the journeys
        const deletedJourneys = await tx.journey.deleteMany({
          where: { id: { in: journeyIds } }
        })

        deletedJourneysCount = deletedJourneys.count
      }

      // Clean up test teams and related data
      if (testTeams.length > 0) {
        const teamIds = testTeams.map((t) => t.id)

        // Delete related data first
        await tx.userTeam.deleteMany({
          where: { teamId: { in: teamIds } }
        })

        await tx.userTeamInvite.deleteMany({
          where: { teamId: { in: teamIds } }
        })

        // Delete journeys owned by these teams
        const teamJourneys = await tx.journey.findMany({
          where: { teamId: { in: teamIds } },
          select: { id: true }
        })

        if (teamJourneys.length > 0) {
          const teamJourneyIds = teamJourneys.map((j) => j.id)

          await tx.userJourney.deleteMany({
            where: { journeyId: { in: teamJourneyIds } }
          })

          await tx.journeyVisitor.deleteMany({
            where: { journeyId: { in: teamJourneyIds } }
          })

          await tx.event.deleteMany({
            where: { journeyId: { in: teamJourneyIds } }
          })

          await tx.block.deleteMany({
            where: { journeyId: { in: teamJourneyIds } }
          })

          await tx.userInvite.deleteMany({
            where: { journeyId: { in: teamJourneyIds } }
          })

          await tx.journey.deleteMany({
            where: { id: { in: teamJourneyIds } }
          })
        }

        // Finally delete the teams
        const deletedTeams = await tx.team.deleteMany({
          where: { id: { in: teamIds } }
        })

        deletedTeamsCount = deletedTeams.count
      }

      // Clean up test invitations
      if (testTeamInvites.length > 0) {
        const inviteIds = testTeamInvites.map((i) => i.id)
        const deletedTeamInvites = await tx.userTeamInvite.deleteMany({
          where: { id: { in: inviteIds } }
        })

        deletedTeamInvitesCount = deletedTeamInvites.count
      }

      if (testJourneyInvites.length > 0) {
        const inviteIds = testJourneyInvites.map((i) => i.id)
        const deletedJourneyInvites = await tx.userInvite.deleteMany({
          where: { id: { in: inviteIds } }
        })

        deletedJourneyInvitesCount = deletedJourneyInvites.count
      }

      // Return counts for logging outside transaction
      return {
        deletedJourneysCount,
        deletedTeamsCount,
        deletedTeamInvitesCount,
        deletedJourneyInvitesCount
      }
    })

    // Log results after successful transaction
    if (testJourneys.length > 0) {
      logger?.info(
        { deletedJourneys: results.deletedJourneysCount },
        'Deleted test journeys'
      )
    }

    if (testTeams.length > 0) {
      logger?.info(
        { deletedTeams: results.deletedTeamsCount },
        'Deleted test teams'
      )
    }

    if (testTeamInvites.length > 0) {
      logger?.info(
        { deletedTeamInvites: results.deletedTeamInvitesCount },
        'Deleted test team invitations'
      )
    }

    if (testJourneyInvites.length > 0) {
      logger?.info(
        { deletedJourneyInvites: results.deletedJourneyInvitesCount },
        'Deleted test journey invitations'
      )
    }

    logger?.info('E2E cleanup completed successfully')
  } catch (error) {
    logger?.error({ error }, 'E2E cleanup failed')
    throw error
  }
}
