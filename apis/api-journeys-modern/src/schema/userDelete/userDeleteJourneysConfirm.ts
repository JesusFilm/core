import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { LogEntry, createLog } from './types'
import { UserDeleteJourneysLogEntry } from './userDeleteJourneysCheck'

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
      const deletedUserJourneyIds: string[] = []
      const deletedUserTeamIds: string[] = []
      const journeyIdsToDelete: string[] = []
      const teamIdsToDelete: string[] = []

      try {
        // Phase 1: Analyze and transfer ownership (lightweight, use transaction)
        await prisma.$transaction(async (tx) => {
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
              if (nextOwner.role === 'owner') {
                logs.push(
                  createLog(
                    `Journey "${uj.journey.title}" already has another owner (${nextOwner.userId}), skipping transfer`
                  )
                )
              } else {
                await tx.userJourney.updateMany({
                  where: {
                    journeyId: uj.journey.id,
                    userId: nextOwner.userId
                  },
                  data: { role: 'owner' }
                })
                logs.push(
                  createLog(
                    `🔄 Transferred ownership of journey "${uj.journey.title}" to user ${nextOwner.userId}`
                  )
                )
              }
            }
          }

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
              const existingManager = others.find((o) => o.role === 'manager')
              if (existingManager != null) {
                logs.push(
                  createLog(
                    `Team "${ut.team.title}" already has another manager (${existingManager.userId}), skipping transfer`
                  )
                )
              } else {
                const nextManager = others[0]
                await tx.userTeam.updateMany({
                  where: {
                    teamId: ut.team.id,
                    userId: nextManager.userId
                  },
                  data: { role: 'manager' }
                })
                logs.push(
                  createLog(
                    `🔄 Transferred manager role of team "${ut.team.title}" to user ${nextManager.userId}`
                  )
                )
              }
            }
          }
        })
        logs.push(createLog('✅ Ownership transfers completed'))

        // Phase 2: Remove user memberships
        const ujRecords = await prisma.userJourney.findMany({
          where: { userId },
          select: { id: true }
        })
        deletedUserJourneyIds.push(...ujRecords.map((r) => r.id))
        await prisma.userJourney.deleteMany({ where: { userId } })
        logs.push(
          createLog(
            `🗑️ Removed ${ujRecords.length} user-journey memberships`
          )
        )

        const utRecords = await prisma.userTeam.findMany({
          where: { userId },
          select: { id: true }
        })
        deletedUserTeamIds.push(...utRecords.map((r) => r.id))
        await prisma.userTeam.deleteMany({ where: { userId } })
        logs.push(
          createLog(`🗑️ Removed ${utRecords.length} user-team memberships`)
        )

        // Phase 3: Delete sole-accessor journeys one at a time (heavy cascades)
        for (const journeyId of journeyIdsToDelete) {
          await prisma.journey.delete({ where: { id: journeyId } })
          logs.push(createLog(`🗑️ Deleted journey ${journeyId}`))
        }
        if (journeyIdsToDelete.length > 0) {
          logs.push(
            createLog(
              `🗑️ Deleted ${journeyIdsToDelete.length} journeys total`
            )
          )
        }

        // Phase 4: Delete sole-member teams
        if (teamIdsToDelete.length > 0) {
          await prisma.team.deleteMany({
            where: { id: { in: teamIdsToDelete } }
          })
          logs.push(createLog(`🗑️ Deleted ${teamIdsToDelete.length} teams`))
        }

        // Phase 5: Clean up related records
        const journeyNotifications =
          await prisma.journeyNotification.deleteMany({ where: { userId } })
        if (journeyNotifications.count > 0)
          logs.push(
            createLog(
              `Deleted ${journeyNotifications.count} journey notifications`
            )
          )

        const userTeamInvites = await prisma.userTeamInvite.deleteMany({
          where: {
            OR: [{ senderId: userId }, { receipientId: userId }]
          }
        })
        if (userTeamInvites.count > 0)
          logs.push(
            createLog(`Deleted ${userTeamInvites.count} team invites`)
          )

        const userInvites = await prisma.userInvite.deleteMany({
          where: { senderId: userId }
        })
        if (userInvites.count > 0)
          logs.push(
            createLog(`Deleted ${userInvites.count} journey invites`)
          )

        const exportLogs = await prisma.journeyEventsExportLog.deleteMany({
          where: { userId }
        })
        if (exportLogs.count > 0)
          logs.push(createLog(`Deleted ${exportLogs.count} export logs`))

        const journeyThemes = await prisma.journeyTheme.deleteMany({
          where: { userId }
        })
        if (journeyThemes.count > 0)
          logs.push(
            createLog(`Deleted ${journeyThemes.count} journey themes`)
          )

        const journeyProfile = await prisma.journeyProfile.deleteMany({
          where: { userId }
        })
        if (journeyProfile.count > 0)
          logs.push(
            createLog(`Deleted ${journeyProfile.count} journey profile`)
          )

        const integrations = await prisma.integration.deleteMany({
          where: { userId }
        })
        if (integrations.count > 0)
          logs.push(createLog(`Deleted ${integrations.count} integrations`))

        const userRoles = await prisma.userRole.deleteMany({
          where: { userId }
        })
        if (userRoles.count > 0)
          logs.push(createLog(`Deleted ${userRoles.count} user roles`))

        const visitors = await prisma.visitor.deleteMany({
          where: { userId }
        })
        if (visitors.count > 0)
          logs.push(createLog(`Deleted ${visitors.count} visitor records`))

        logs.push(createLog('✅ Journeys database cleanup completed'))

        return {
          success: true,
          deletedJourneyIds: journeyIdsToDelete,
          deletedTeamIds: teamIdsToDelete,
          deletedUserJourneyIds,
          deletedUserTeamIds,
          logs
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        logs.push(
          createLog(
            `❌ Journeys database cleanup failed: ${message}`,
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
