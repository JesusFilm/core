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
  const deletedUserJourneyIds: string[] = []
  const deletedUserTeamIds: string[] = []
  const journeyIdsToDelete: string[] = []
  const teamIdsToDelete: string[] = []

  try {
    // Phase 1: Analyze and transfer ownership (lightweight, use transaction)
    // Logs are buffered inside the transaction and only merged after commit so
    // a rollback doesn't leave misleading "transferred ownership" entries.
    const txLogs = await prisma.$transaction(async (tx) => {
      const localLogs: LogEntry[] = []

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
            localLogs.push(
              createLog(
                `Journey "${uj.journey.title}" already has another owner (${existingOwner.userId}), skipping transfer`
              )
            )
          } else {
            const nextOwner = others.find((o) => o.role === 'editor') ?? others[0]
            await tx.userJourney.updateMany({
              where: {
                journeyId: uj.journey.id,
                userId: nextOwner.userId
              },
              data: { role: 'owner' }
            })
            localLogs.push(
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
            localLogs.push(
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
            localLogs.push(
              createLog(
                `🔄 Transferred manager role of team "${ut.team.title}" to user ${nextManager.userId}`
              )
            )
          }
        }
      }

      return localLogs
    })
    logs.push(...txLogs)
    logs.push(createLog('✅ Ownership transfers completed'))

    // Phase 2: Remove user memberships (IDs already collected in Phase 1)
    await prisma.userJourney.deleteMany({ where: { userId } })
    logs.push(
      createLog(
        `🗑️ Removed ${deletedUserJourneyIds.length} user-journey memberships`
      )
    )

    await prisma.userTeam.deleteMany({ where: { userId } })
    logs.push(
      createLog(`🗑️ Removed ${deletedUserTeamIds.length} user-team memberships`)
    )

    // Phase 3: Delete sole-accessor journeys
    if (journeyIdsToDelete.length > 0) {
      // Pre-delete heavy child records in parallel
      const [eventCount, journeyVisitorCount, actionCount] = await Promise.all([
        prisma.event.deleteMany({
          where: { journeyId: { in: journeyIdsToDelete } }
        }),
        prisma.journeyVisitor.deleteMany({
          where: { journeyId: { in: journeyIdsToDelete } }
        }),
        prisma.action.deleteMany({
          where: { journeyId: { in: journeyIdsToDelete } }
        })
      ])
      // Blocks after actions (actions reference blocks)
      const blockCount = await prisma.block.deleteMany({
        where: { journeyId: { in: journeyIdsToDelete } }
      })

      if (eventCount.count > 0)
        logs.push(createLog(`🗑️ Deleted ${eventCount.count} events`))
      if (journeyVisitorCount.count > 0)
        logs.push(
          createLog(`🗑️ Deleted ${journeyVisitorCount.count} journey visitors`)
        )
      if (actionCount.count > 0)
        logs.push(createLog(`🗑️ Deleted ${actionCount.count} actions`))
      if (blockCount.count > 0)
        logs.push(createLog(`🗑️ Deleted ${blockCount.count} blocks`))

      // Now delete the journeys (cascades are already cleared)
      await prisma.journey.deleteMany({
        where: { id: { in: journeyIdsToDelete } }
      })
      logs.push(createLog(`🗑️ Deleted ${journeyIdsToDelete.length} journeys`))
    }

    // Phase 4: Delete sole-member teams
    if (teamIdsToDelete.length > 0) {
      await prisma.team.deleteMany({
        where: { id: { in: teamIdsToDelete } }
      })
      logs.push(createLog(`🗑️ Deleted ${teamIdsToDelete.length} teams`))
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
      prisma.journeyNotification.deleteMany({ where: { userId } }),
      prisma.userTeamInvite.deleteMany({
        where: { OR: [{ senderId: userId }, { receipientId: userId }] }
      }),
      prisma.userInvite.deleteMany({ where: { senderId: userId } }),
      prisma.journeyEventsExportLog.deleteMany({ where: { userId } }),
      prisma.journeyTheme.deleteMany({ where: { userId } }),
      prisma.journeyProfile.deleteMany({ where: { userId } }),
      prisma.integration.deleteMany({ where: { userId } }),
      prisma.userRole.deleteMany({ where: { userId } }),
      prisma.visitor.deleteMany({ where: { userId } })
    ])

    if (journeyNotifications.count > 0)
      logs.push(
        createLog(`Deleted ${journeyNotifications.count} journey notifications`)
      )
    if (userTeamInvites.count > 0)
      logs.push(createLog(`Deleted ${userTeamInvites.count} team invites`))
    if (userInvites.count > 0)
      logs.push(createLog(`Deleted ${userInvites.count} journey invites`))
    if (exportLogs.count > 0)
      logs.push(createLog(`Deleted ${exportLogs.count} export logs`))
    if (journeyThemes.count > 0)
      logs.push(createLog(`Deleted ${journeyThemes.count} journey themes`))
    if (journeyProfile.count > 0)
      logs.push(createLog(`Deleted ${journeyProfile.count} journey profile`))
    if (integrations.count > 0)
      logs.push(createLog(`Deleted ${integrations.count} integrations`))
    if (userRoles.count > 0)
      logs.push(createLog(`Deleted ${userRoles.count} user roles`))
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
