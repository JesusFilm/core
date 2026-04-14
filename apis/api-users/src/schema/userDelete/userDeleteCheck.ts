import { builder } from '../builder'

import { type LogEntry, lookupUser } from './service'

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
      const { user, firebase, logs } = await lookupUser(idType, id)

      if (user == null) {
        return {
          userId: firebase.uid ?? '',
          userEmail: firebase.email,
          userFirstName: '(Firebase only)',
          logs
        }
      }

      return {
        userId: user.id,
        userEmail: user.email,
        userFirstName: user.firstName,
        logs
      }
    }
  })
)

export { UserDeleteIdType, UserDeleteLogEntry }
