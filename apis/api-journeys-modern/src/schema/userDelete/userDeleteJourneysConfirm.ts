import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { UserDeleteJourneysLogEntry } from './userDeleteJourneysCheck'

interface LogEntry {
  message: string
  level: string
  timestamp: string
}

function createLog(message: string, level = 'info'): LogEntry {
  return { message, level, timestamp: new Date().toISOString() }
}

interface JourneysConfirmResultShape {
  success: boolean
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
  logs: LogEntry[]
}

const UserDeleteJourneysConfirmResult =
  builder.objectRef<JourneysConfirmResultShape>(
    'UserDeleteJourneysConfirmResult'
  )

builder.objectType(UserDeleteJourneysConfirmResult, {
  fields: (t) => ({
    success: t.exposeBoolean('success', { nullable: false }),
    deletedJourneyIds: t.exposeStringList('deletedJourneyIds', {
      nullable: false
    }),
    deletedTeamIds: t.exposeStringList('deletedTeamIds', { nullable: false }),
    deletedUserJourneyIds: t.exposeStringList('deletedUserJourneyIds', {
      nullable: false
    }),
    deletedUserTeamIds: t.exposeStringList('deletedUserTeamIds', {
      nullable: false
    }),
    logs: t.field({
      type: [UserDeleteJourneysLogEntry],
      nullable: false,
      resolve: (parent) => parent.logs
    })
  })
})

builder.mutationField('userDeleteJourneysConfirm', (t) =>
  t.withAuth({ isValidInterop: true }).field({
    type: UserDeleteJourneysConfirmResult,
    nullable: false,
    args: {
      userId: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userId }) => {
      const logs: LogEntry[] = []

      try {
        const result = await prisma.$transaction(
          async (tx) => {
            const deletedUserJourneyIds: string[] = []
            const deletedUserTeamIds: string[] = []
            const journeyIdsToDelete: string[] = []
            const teamIdsToDelete: string[] = []

            // Analyze journeys
            const userJourneys = await tx.userJourney.findMany({
              where: { userId },
              include: {
                journey: {
                  select: {
                    id: true,
                    title: true,
                    userJourneys: {
                      select: { id: true, userId: true, role: true }
                    }
                  }
                }
              }
            })

            for (const uj of userJourneys) {
              const others = uj.journey.userJourneys.filter(
                (j) => j.userId !== userId
              )
              if (others.length === 0) {
                journeyIdsToDelete.push(uj.journey.id)
              } else if (uj.role === 'owner') {
                const nextOwner =
                  others.find((o) => o.role === 'editor') ?? others[0]
                await tx.userJourney.updateMany({
                  where: {
                    journeyId: uj.journey.id,
                    userId: nextOwner.userId
                  },
                  data: { role: 'owner' }
                })
                logs.push(
                  createLog(
                    `Transferred ownership of journey "${uj.journey.title}" to user ${nextOwner.userId}`
                  )
                )
              }
            }

            // Analyze teams
            const userTeams = await tx.userTeam.findMany({
              where: { userId },
              include: {
                team: {
                  select: {
                    id: true,
                    title: true,
                    userTeams: {
                      select: { id: true, userId: true, role: true }
                    }
                  }
                }
              }
            })

            for (const ut of userTeams) {
              const others = ut.team.userTeams.filter(
                (t) => t.userId !== userId
              )
              if (others.length === 0) {
                teamIdsToDelete.push(ut.team.id)
              } else if (ut.role === 'manager') {
                const nextManager =
                  others.find((o) => o.role === 'manager') ?? others[0]
                await tx.userTeam.updateMany({
                  where: {
                    teamId: ut.team.id,
                    userId: nextManager.userId
                  },
                  data: { role: 'manager' }
                })
                logs.push(
                  createLog(
                    `Transferred manager role of team "${ut.team.title}" to user ${nextManager.userId}`
                  )
                )
              }
            }

            // Delete user's memberships
            const ujRecords = await tx.userJourney.findMany({
              where: { userId },
              select: { id: true }
            })
            deletedUserJourneyIds.push(...ujRecords.map((r) => r.id))
            await tx.userJourney.deleteMany({ where: { userId } })
            logs.push(
              createLog(
                `Removed ${ujRecords.length} user-journey memberships`
              )
            )

            const utRecords = await tx.userTeam.findMany({
              where: { userId },
              select: { id: true }
            })
            deletedUserTeamIds.push(...utRecords.map((r) => r.id))
            await tx.userTeam.deleteMany({ where: { userId } })
            logs.push(
              createLog(`Removed ${utRecords.length} user-team memberships`)
            )

            // Delete sole-accessor journeys
            if (journeyIdsToDelete.length > 0) {
              await tx.journey.deleteMany({
                where: { id: { in: journeyIdsToDelete } }
              })
              logs.push(
                createLog(`Deleted ${journeyIdsToDelete.length} journeys`)
              )
            }

            // Delete sole-member teams
            if (teamIdsToDelete.length > 0) {
              await tx.team.deleteMany({
                where: { id: { in: teamIdsToDelete } }
              })
              logs.push(
                createLog(`Deleted ${teamIdsToDelete.length} teams`)
              )
            }

            // Clean up related records
            const journeyNotifications =
              await tx.journeyNotification.deleteMany({ where: { userId } })
            if (journeyNotifications.count > 0)
              logs.push(
                createLog(
                  `Deleted ${journeyNotifications.count} journey notifications`
                )
              )

            const userTeamInvites = await tx.userTeamInvite.deleteMany({
              where: {
                OR: [{ senderId: userId }, { receipientId: userId }]
              }
            })
            if (userTeamInvites.count > 0)
              logs.push(
                createLog(`Deleted ${userTeamInvites.count} team invites`)
              )

            const userInvites = await tx.userInvite.deleteMany({
              where: { senderId: userId }
            })
            if (userInvites.count > 0)
              logs.push(
                createLog(`Deleted ${userInvites.count} journey invites`)
              )

            const exportLogs = await tx.journeyEventsExportLog.deleteMany({
              where: { userId }
            })
            if (exportLogs.count > 0)
              logs.push(createLog(`Deleted ${exportLogs.count} export logs`))

            const journeyThemes = await tx.journeyTheme.deleteMany({
              where: { userId }
            })
            if (journeyThemes.count > 0)
              logs.push(
                createLog(`Deleted ${journeyThemes.count} journey themes`)
              )

            const journeyProfile = await tx.journeyProfile.deleteMany({
              where: { userId }
            })
            if (journeyProfile.count > 0)
              logs.push(
                createLog(`Deleted ${journeyProfile.count} journey profile`)
              )

            const integrations = await tx.integration.deleteMany({
              where: { userId }
            })
            if (integrations.count > 0)
              logs.push(
                createLog(`Deleted ${integrations.count} integrations`)
              )

            const userRoles = await tx.userRole.deleteMany({
              where: { userId }
            })
            if (userRoles.count > 0)
              logs.push(createLog(`Deleted ${userRoles.count} user roles`))

            const visitors = await tx.visitor.deleteMany({
              where: { userId }
            })
            if (visitors.count > 0)
              logs.push(
                createLog(`Deleted ${visitors.count} visitor records`)
              )

            return {
              deletedJourneyIds: journeyIdsToDelete,
              deletedTeamIds: teamIdsToDelete,
              deletedUserJourneyIds,
              deletedUserTeamIds
            }
          },
          { timeout: 60000 }
        )

        logs.push(createLog('Journeys database cleanup completed'))

        return { success: true, ...result, logs }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        logs.push(
          createLog(
            `Journeys database cleanup failed: ${message}. All changes reverted.`,
            'error'
          )
        )
        return {
          success: false,
          deletedJourneyIds: [],
          deletedTeamIds: [],
          deletedUserJourneyIds: [],
          deletedUserTeamIds: [],
          logs
        }
      }
    }
  })
)
