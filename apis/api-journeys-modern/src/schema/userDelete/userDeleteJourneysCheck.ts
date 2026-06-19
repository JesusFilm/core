import { GraphQLError } from 'graphql'

import { prisma as usersDb } from '@core/prisma/users/client'

import { builder } from '../builder'

import { type LogEntry, checkJourneysData } from './service'

// Enum mirrors the LogLevel union in the shared types lib.
// Values are uppercase in the GraphQL schema; the internal representation
// remains lowercase to match the LogEntry type.
const UserDeleteJourneysLogLevel = builder.enumType('USER_DELETE_LOG_LEVEL', {
  values: {
    INFO: { value: 'info' as const },
    WARN: { value: 'warn' as const },
    ERROR: { value: 'error' as const }
  }
})

const UserDeleteJourneysLogEntry = builder.objectRef<LogEntry>(
  'UserDeleteJourneysLogEntry'
)

builder.objectType(UserDeleteJourneysLogEntry, {
  fields: (t) => ({
    message: t.exposeString('message', { nullable: false }),
    level: t.field({
      type: UserDeleteJourneysLogLevel,
      nullable: false,
      resolve: (parent) => parent.level
    }),
    timestamp: t.exposeString('timestamp', { nullable: false })
  })
})

interface UserDeleteJourneysCheckResultShape {
  journeysToDelete: number
  journeysToTransfer: number
  journeysToRemove: number
  teamsToDelete: number
  teamsToTransfer: number
  teamsToRemove: number
  logs: LogEntry[]
}

const UserDeleteJourneysCheckResult =
  builder.objectRef<UserDeleteJourneysCheckResultShape>(
    'UserDeleteJourneysCheckResult'
  )

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

export { UserDeleteJourneysLogEntry }

builder.mutationField('userDeleteJourneysCheck', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserDeleteJourneysCheckResult,
    nullable: false,
    args: {
      userId: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userId }, ctx) => {
      // Authorization: superAdmin can check any user; regular users can only check themselves
      const caller = await usersDb.user.findUnique({
        where: { userId: ctx.user.id },
        select: { superAdmin: true }
      })
      if (!caller?.superAdmin && userId !== ctx.user.id) {
        throw new GraphQLError(
          'Forbidden: you can only delete your own account',
          { extensions: { code: 'FORBIDDEN' } }
        )
      }
      return await checkJourneysData(userId)
    }
  })
)
