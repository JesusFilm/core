import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { LogEntry, createLog } from './types'

const UserDeleteJourneysLogEntry = builder.objectRef<LogEntry>(
  'UserDeleteJourneysLogEntry'
)

builder.objectType(UserDeleteJourneysLogEntry, {
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false }),
    level: t.exposeString('level', { nullable: false }),
    timestamp: t.exposeString('timestamp', { nullable: false })
  })
})

interface JourneysCheckResultShape {
  journeysToDelete: number
  journeysToTransfer: number
  journeysToRemove: number
  teamsToDelete: number
  teamsToTransfer: number
  teamsToRemove: number
  logs: LogEntry[]
}

const UserDeleteJourneysCheckResult =
  builder.objectRef<JourneysCheckResultShape>('UserDeleteJourneysCheckResult')

builder.objectType(UserDeleteJourneysCheckResult, {
  fields: (t) => ({
    journeysToDelete: t.exposeInt('journeysToDelete', { nullable: false }),
    journeysToTransfer: t.exposeInt('journeysToTransfer', { nullable: false }),
    journeysToRemove: t.exposeInt('journeysToRemove', { nullable: false }),
    teamsToDelete: t.exposeInt('teamsToDelete', { nullable: false }),
    teamsToTransfer: t.exposeInt('teamsToTransfer', { nullable: false }),
    teamsToRemove: t.exposeInt('teamsToRemove', { nullable: false }),
    logs: t.field({
      type: [UserDeleteJourneysLogEntry],
      nullable: false,
      resolve: (parent) => parent.logs
    })
  })
})

builder.mutationField('userDeleteJourneysCheck', (t) =>
  t.withAuth({ isValidInterop: true }).field({
    type: UserDeleteJourneysCheckResult,
    nullable: false,
    args: {
      userId: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userId }) => {
      const logs: LogEntry[] = []

      // Check journeys
      const userJourneys = await prisma.userJourney.findMany({
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

      logs.push(createLog(`📂 ${userJourneys.length} journeys found`))

      let journeysToDelete = 0
      let journeysToTransfer = 0
      let journeysToRemove = 0

      for (const uj of userJourneys) {
        const others = uj.journey.userJourneys.filter(
          (j) => j.userId !== userId
        )
        if (others.length === 0) {
          journeysToDelete++
        } else if (uj.role === 'owner') {
          journeysToTransfer++
        } else {
          journeysToRemove++
        }
      }

      if (journeysToDelete > 0)
        logs.push(
          createLog(
            `${journeysToDelete} journeys will be deleted (user is sole accessor)`
          )
        )
      if (journeysToTransfer > 0)
        logs.push(
          createLog(
            `${journeysToTransfer} journey ownerships will be transferred`
          )
        )
      if (journeysToRemove > 0)
        logs.push(
          createLog(`${journeysToRemove} journey memberships will be removed`)
        )

      // Check teams
      const userTeams = await prisma.userTeam.findMany({
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

      logs.push(createLog(`👥 ${userTeams.length} teams found`))

      let teamsToDelete = 0
      let teamsToTransfer = 0
      let teamsToRemove = 0

      for (const ut of userTeams) {
        const others = ut.team.userTeams.filter((t) => t.userId !== userId)
        if (others.length === 0) {
          teamsToDelete++
        } else if (ut.role === 'manager') {
          teamsToTransfer++
        } else {
          teamsToRemove++
        }
      }

      if (teamsToDelete > 0)
        logs.push(
          createLog(
            `${teamsToDelete} teams will be deleted (user is sole member)`
          )
        )
      if (teamsToTransfer > 0)
        logs.push(
          createLog(`${teamsToTransfer} team manager roles will be transferred`)
        )
      if (teamsToRemove > 0)
        logs.push(
          createLog(`${teamsToRemove} team memberships will be removed`)
        )

      // Check related records
      const [
        userRole,
        journeyProfile,
        integration,
        visitor,
        journeyNotification,
        userTeamInvite,
        userInvite,
        journeyEventsExportLog,
        journeyTheme
      ] = await Promise.all([
        prisma.userRole.count({ where: { userId } }),
        prisma.journeyProfile.count({ where: { userId } }),
        prisma.integration.count({ where: { userId } }),
        prisma.visitor.count({ where: { userId } }),
        prisma.journeyNotification.count({ where: { userId } }),
        prisma.userTeamInvite.count({
          where: { OR: [{ senderId: userId }, { receipientId: userId }] }
        }),
        prisma.userInvite.count({ where: { senderId: userId } }),
        prisma.journeyEventsExportLog.count({ where: { userId } }),
        prisma.journeyTheme.count({ where: { userId } })
      ])

      const tablesToClean: string[] = []
      if (userRole > 0) tablesToClean.push(`UserRole(${userRole})`)
      if (journeyProfile > 0)
        tablesToClean.push(`JourneyProfile(${journeyProfile})`)
      if (integration > 0) tablesToClean.push(`Integration(${integration})`)
      if (visitor > 0) tablesToClean.push(`Visitor(${visitor})`)
      if (journeyNotification > 0)
        tablesToClean.push(`JourneyNotification(${journeyNotification})`)
      if (userTeamInvite > 0)
        tablesToClean.push(`UserTeamInvite(${userTeamInvite})`)
      if (userInvite > 0) tablesToClean.push(`UserInvite(${userInvite})`)
      if (journeyEventsExportLog > 0)
        tablesToClean.push(`JourneyEventsExportLog(${journeyEventsExportLog})`)
      if (journeyTheme > 0) tablesToClean.push(`JourneyTheme(${journeyTheme})`)

      if (tablesToClean.length > 0) {
        logs.push(
          createLog(`Related records to clean up: ${tablesToClean.join(', ')}`)
        )
      } else {
        logs.push(createLog('✨ No additional related records found'))
      }

      logs.push(
        createLog('✅ Check complete. Ready for deletion confirmation.')
      )

      return {
        journeysToDelete,
        journeysToTransfer,
        journeysToRemove,
        teamsToDelete,
        teamsToTransfer,
        teamsToRemove,
        logs
      }
    }
  })
)

export { UserDeleteJourneysLogEntry }
