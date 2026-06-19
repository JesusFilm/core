import { GraphQLError } from 'graphql'

import { prisma as usersDb } from '@core/prisma/users/client'

import { builder } from '../builder'

import { type LogEntry, deleteJourneysData } from './service'
import { UserDeleteJourneysLogEntry } from './userDeleteJourneysCheck'

interface UserDeleteJourneysConfirmResultShape {
  success: boolean
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
  logs: LogEntry[]
}

const UserDeleteJourneysConfirmResult =
  builder.objectRef<UserDeleteJourneysConfirmResultShape>(
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
  t.withAuth({ isAuthenticated: true }).field({
    type: UserDeleteJourneysConfirmResult,
    nullable: false,
    args: {
      userId: t.arg.string({ required: true })
    },
    resolve: async (_parent, { userId }, ctx) => {
      // Authorization: superAdmin can delete any user; regular users can only delete themselves
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
      return await deleteJourneysData(userId)
    }
  })
)
