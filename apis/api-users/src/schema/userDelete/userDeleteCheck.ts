import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/users/client'

import { builder } from '../builder'

import { type LogEntry, lookupUser } from './service'

const UserDeleteIdType = builder.enumType('UserDeleteIdType', {
  values: ['databaseId', 'email', 'jwt'] as const
})

// Enum mirrors the LogLevel union in the shared types lib.
// Values are uppercase in the GraphQL schema; the internal representation
// remains lowercase to match the LogEntry type.
const UserDeleteLogLevel = builder.enumType('USER_DELETE_LOG_LEVEL', {
  values: {
    INFO: { value: 'info' as const },
    WARN: { value: 'warn' as const },
    ERROR: { value: 'error' as const }
  }
})

const UserDeleteLogEntry = builder.objectRef<LogEntry>('UserDeleteLogEntry')

builder.objectType(UserDeleteLogEntry, {
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false }),
    level: t.field({
      type: UserDeleteLogLevel,
      nullable: false,
      resolve: (parent) => parent.level
    }),
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
  t.withAuth({ isAuthenticated: true }).field({
    type: UserDeleteCheckResult,
    nullable: false,
    args: {
      idType: t.arg({ type: UserDeleteIdType, required: true }),
      id: t.arg.string({ required: true })
    },
    resolve: async (_parent, { idType, id }, ctx) => {
      const [{ user, firebase, logs }, caller] = await Promise.all([
        lookupUser(idType, id),
        prisma.user.findUnique({ where: { userId: ctx.currentUser.id } })
      ])

      // Authorization: superAdmin can check any user; regular users can only check themselves
      if (!caller?.superAdmin) {
        const targetUserId = user?.userId ?? firebase.uid
        if (targetUserId !== ctx.currentUser.id) {
          throw new GraphQLError(
            'Forbidden: you can only delete your own account',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }
      }

      if (user == null) {
        return {
          userId: firebase.uid ?? '',
          userEmail: firebase.email,
          userFirstName: '(Firebase only)',
          logs
        }
      }

      return {
        userId: user.userId,
        userEmail: user.email,
        userFirstName: user.firstName,
        logs
      }
    }
  })
)

export { UserDeleteIdType, UserDeleteLogEntry }
