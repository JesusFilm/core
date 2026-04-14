import { prisma } from '@core/prisma/journeys/client'

import { LogEntry, createLog } from './types'

export interface DeleteJourneysDataResult {
  success: boolean
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
  logs: LogEntry[]
}

export async function deleteJourneysData(
  userId: string
): Promise<DeleteJourneysDataResult> {
  const logs: LogEntry[] = []

  try {
    const result = await prisma.$transaction(async (tx) => {
      const txLogs: LogEntry[] = []
      const deletedUserJourneyIds: string[] = []
      const deletedUserTeamIds: string[] = []
      const journeyIdsToDelete: string[] = []
      const teamIdsToDelete: string[] = []

      // Phase 1: Analyze and transfer ownership
      // Logs are buffered inside the transaction and only merged after commit so
      // a rollback doesn't leave misleading "transferred ownership" entries.
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

      deletedUserJourneyIds.push(...userJourneys.map((uj) => uj.id))

      for (const uj of userJourneys) {
        // Exclude inviteRequested — pending invites are not accepted
        // collaborators and must not be counted when deciding whether to
        // transfer ownership or mark a journey for deletion.
        const others = uj.journey.userJourneys.filter(
          (j) => j.userId !== userId && j.role !== 'inviteRequested'
        )
        if (others.length === 0) {
          journeyIdsToDelete.push(uj.journey.id)
        } else if (uj.role === 'owner') {
          const existingOwner = others.find((o) => o.role === 'owner')
          if (existingOwner != null) {
            txLogs.push(
              createLog(
                `Journey "${uj.journey.title}" already has another owner (${existingOwner.userId}), skipping transfer`
              )
            )
          } else {
            const nextOwner =
              others.find((o) => o.role === 'editor') ?? others[0]
            await tx.userJourney.updateMany({
              where: {
                journeyId: uj.journey.id,
                userId: nextOwner.userId
              },
              data: { role: 'owner' }
            })
            txLogs.push(
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

      deletedUserTeamIds.push(...userTeams.map((ut) => ut.id))

      for (const ut of userTeams) {
        const others = ut.team.userTeams.filter((t) => t.userId !== userId)
        if (others.length === 0) {
          teamIdsToDelete.push(ut.team.id)
        } else if (ut.role === 'manager') {
          const existingManager = others.find((o) => o.role === 'manager')
          if (existingManager != null) {
            txLogs.push(
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
            txLogs.push(
              createLog(
                `🔄 Transferred manager role of team "${ut.team.title}" to user ${nextManager.userId}`
              )
            )
          }
        }
      }

      txLogs.push(createLog('✅ Ownership transfers completed'))

      // Phase 2: Remove user memberships (IDs already collected in Phase 1)
      await tx.userJourney.deleteMany({ where: { userId } })
      txLogs.push(
        createLog(
          `🗑️ Removed ${deletedUserJourneyIds.length} user-journey memberships`
        )
      )

      await tx.userTeam.deleteMany({ where: { userId } })
      txLogs.push(
        createLog(
          `🗑️ Removed ${deletedUserTeamIds.length} user-team memberships`
        )
      )

      // Phase 3: Delete sole-accessor journeys
      if (journeyIdsToDelete.length > 0) {
        // Pre-delete heavy child records in parallel
        const [eventCount, journeyVisitorCount, actionCount] =
          await Promise.all([
            tx.event.deleteMany({
              where: { journeyId: { in: journeyIdsToDelete } }
            }),
            tx.journeyVisitor.deleteMany({
              where: { journeyId: { in: journeyIdsToDelete } }
            }),
            tx.action.deleteMany({
              where: { journeyId: { in: journeyIdsToDelete } }
            })
          ])
        // Blocks after actions (actions reference blocks)
        const blockCount = await tx.block.deleteMany({
          where: { journeyId: { in: journeyIdsToDelete } }
        })

        if (eventCount.count > 0)
          txLogs.push(createLog(`🗑️ Deleted ${eventCount.count} events`))
        if (journeyVisitorCount.count > 0)
          txLogs.push(
            createLog(
              `🗑️ Deleted ${journeyVisitorCount.count} journey visitors`
            )
          )
        if (actionCount.count > 0)
          txLogs.push(createLog(`🗑️ Deleted ${actionCount.count} actions`))
        if (blockCount.count > 0)
          txLogs.push(createLog(`🗑️ Deleted ${blockCount.count} blocks`))

        // Now delete the journeys (cascades are already cleared)
        await tx.journey.deleteMany({
          where: { id: { in: journeyIdsToDelete } }
        })
        txLogs.push(
          createLog(`🗑️ Deleted ${journeyIdsToDelete.length} journeys`)
        )
      }

      // Phase 4: Delete sole-member teams
      if (teamIdsToDelete.length > 0) {
        await tx.team.deleteMany({
          where: { id: { in: teamIdsToDelete } }
        })
        txLogs.push(createLog(`🗑️ Deleted ${teamIdsToDelete.length} teams`))
      }

      // Phase 5: Clean up related records (all independent, run in parallel)
      const [
        journeyNotifications,
        userTeamInvites,
        userInvites,
        exportLogs,
        journeyThemes,
        journeyProfile,
        integrations,
        userRoles,
        visitors
      ] = await Promise.all([
        tx.journeyNotification.deleteMany({ where: { userId } }),
        tx.userTeamInvite.deleteMany({
          where: { OR: [{ senderId: userId }, { receipientId: userId }] }
        }),
        tx.userInvite.deleteMany({ where: { senderId: userId } }),
        tx.journeyEventsExportLog.deleteMany({ where: { userId } }),
        tx.journeyTheme.deleteMany({ where: { userId } }),
        tx.journeyProfile.deleteMany({ where: { userId } }),
        tx.integration.deleteMany({ where: { userId } }),
        tx.userRole.deleteMany({ where: { userId } }),
        tx.visitor.deleteMany({ where: { userId } })
      ])

      if (journeyNotifications.count > 0)
        txLogs.push(
          createLog(`Deleted ${journeyNotifications.count} journey notifications`)
        )
      if (userTeamInvites.count > 0)
        txLogs.push(createLog(`Deleted ${userTeamInvites.count} team invites`))
      if (userInvites.count > 0)
        txLogs.push(createLog(`Deleted ${userInvites.count} journey invites`))
      if (exportLogs.count > 0)
        txLogs.push(createLog(`Deleted ${exportLogs.count} export logs`))
      if (journeyThemes.count > 0)
        txLogs.push(createLog(`Deleted ${journeyThemes.count} journey themes`))
      if (journeyProfile.count > 0)
        txLogs.push(createLog(`Deleted ${journeyProfile.count} journey profile`))
      if (integrations.count > 0)
        txLogs.push(createLog(`Deleted ${integrations.count} integrations`))
      if (userRoles.count > 0)
        txLogs.push(createLog(`Deleted ${userRoles.count} user roles`))
      if (visitors.count > 0)
        txLogs.push(createLog(`Deleted ${visitors.count} visitor records`))

      return {
        deletedJourneyIds: journeyIdsToDelete,
        deletedTeamIds: teamIdsToDelete,
        deletedUserJourneyIds,
        deletedUserTeamIds,
        logs: txLogs
      }
    })

    logs.push(...result.logs)
    logs.push(createLog('✅ Journeys database cleanup completed'))

    return {
      success: true,
      deletedJourneyIds: result.deletedJourneyIds,
      deletedTeamIds: result.deletedTeamIds,
      deletedUserJourneyIds: result.deletedUserJourneyIds,
      deletedUserTeamIds: result.deletedUserTeamIds,
      logs
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logs.push(
      createLog(`❌ Journeys database cleanup failed: ${message}`, 'error')
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
