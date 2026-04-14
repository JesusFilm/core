import { builder } from '../builder'

import { type LogEntry, createLog, lookupUser } from './service'

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

      const { user, firebase, logs: lookupLogs } = await lookupUser(idType, id)
      allLogs.push(...lookupLogs)

      // Firebase-only account — no DB user
      if (user == null) {
        allLogs.push(
          createLog(
            '📋 Firebase-only account — no database user record found'
          )
        )
        return {
          userId: firebase.uid ?? '',
          userEmail: firebase.email,
          userFirstName: '(Firebase only)',
          logs: allLogs
        }
      }

      return {
        userId: user.userId,
        userEmail: user.email,
        userFirstName: user.firstName,
        logs: allLogs
      }
    }
  })
)

export { UserDeleteIdType, UserDeleteLogEntry }
