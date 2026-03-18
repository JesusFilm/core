import { builder } from '../builder'

import {
  type LogEntry,
  callJourneysCheck,
  createLog,
  lookupUser
} from './service'

const UserDeleteIdType = builder.enumType('UserDeleteIdType', {
  values: ['databaseId', 'email'] as const
})

const UserDeleteLogEntry = builder.objectRef<LogEntry>('UserDeleteLogEntry')

builder.objectType(UserDeleteLogEntry, {
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false }),
    level: t.exposeString('level', { nullable: false }),
    timestamp: t.exposeString('timestamp', { nullable: false })
  })
})

interface UserDeleteCheckResultShape {
  userId: string
  userEmail: string | null
  userFirstName: string
  journeysToDelete: number
  journeysToTransfer: number
  journeysToRemove: number
  teamsToDelete: number
  teamsToTransfer: number
  teamsToRemove: number
  logs: LogEntry[]
}

const UserDeleteCheckResult = builder.objectRef<UserDeleteCheckResultShape>(
  'UserDeleteCheckResult'
)

builder.objectType(UserDeleteCheckResult, {
  fields: (t) => ({
    userId: t.exposeString('userId', { nullable: false }),
    userEmail: t.exposeString('userEmail'),
    userFirstName: t.exposeString('userFirstName', { nullable: false }),
    journeysToDelete: t.exposeInt('journeysToDelete', { nullable: false }),
    journeysToTransfer: t.exposeInt('journeysToTransfer', { nullable: false }),
    journeysToRemove: t.exposeInt('journeysToRemove', { nullable: false }),
    teamsToDelete: t.exposeInt('teamsToDelete', { nullable: false }),
    teamsToTransfer: t.exposeInt('teamsToTransfer', { nullable: false }),
    teamsToRemove: t.exposeInt('teamsToRemove', { nullable: false }),
    logs: t.field({
      type: [UserDeleteLogEntry],
      nullable: false,
      resolve: (parent) => parent.logs
    })
  })
})

builder.mutationField('userDeleteCheck', (t) =>
  t.withAuth({ isSuperAdmin: true }).field({
    type: UserDeleteCheckResult,
    nullable: false,
    args: {
      idType: t.arg({ type: UserDeleteIdType, required: true }),
      id: t.arg.string({ required: true })
    },
    resolve: async (_parent, { idType, id }) => {
      const allLogs: LogEntry[] = []

      const { user, logs: lookupLogs } = await lookupUser(idType, id)
      allLogs.push(...lookupLogs)

      allLogs.push(createLog('📋 Checking journeys and teams...'))

      const journeysResult = await callJourneysCheck(user.userId)
      allLogs.push(...journeysResult.logs)

      return {
        userId: user.id,
        userEmail: user.email,
        userFirstName: user.firstName,
        journeysToDelete: journeysResult.journeysToDelete,
        journeysToTransfer: journeysResult.journeysToTransfer,
        journeysToRemove: journeysResult.journeysToRemove,
        teamsToDelete: journeysResult.teamsToDelete,
        teamsToTransfer: journeysResult.teamsToTransfer,
        teamsToRemove: journeysResult.teamsToRemove,
        logs: allLogs
      }
    }
  })
)

export { UserDeleteIdType, UserDeleteLogEntry }
