import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/users/client'

import { builder } from '../builder'

import {
  type LogEntry,
  callJourneysConfirm,
  createLog,
  deleteUserData,
  lookupUser
} from './service'
import { UserDeleteIdType, UserDeleteLogEntry } from './userDeleteCheck'

interface UserDeleteResultShape {
  success: boolean
  logs: LogEntry[]
}

const UserDeleteResult =
  builder.objectRef<UserDeleteResultShape>('UserDeleteResult')

builder.objectType(UserDeleteResult, {
  fields: (t) => ({
    success: t.exposeBoolean('success', { nullable: false }),
    logs: t.field({
      type: [UserDeleteLogEntry],
      nullable: false,
      resolve: (parent) => parent.logs
    })
  })
})

builder.mutationField('userDeleteConfirm', (t) =>
  t.withAuth({ isSuperAdmin: true }).field({
    type: UserDeleteResult,
    nullable: false,
    args: {
      idType: t.arg({ type: UserDeleteIdType, required: true }),
      id: t.arg.string({ required: true })
    },
    resolve: async (_parent, { idType, id }, ctx) => {
      const allLogs: LogEntry[] = []

      // Look up the target user
      const { user, logs: lookupLogs } = await lookupUser(idType, id)
      allLogs.push(...lookupLogs)

      // Look up the caller (superAdmin) for audit log
      const caller = await prisma.user.findUnique({
        where: { userId: ctx.currentUser.id }
      })
      if (caller == null) {
        throw new GraphQLError('Caller user not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Phase 1: Journeys DB cleanup via interop
      allLogs.push(createLog('🔄 Starting journeys database cleanup...'))

      const journeysResult = await callJourneysConfirm(user.userId)
      allLogs.push(...journeysResult.logs)

      if (!journeysResult.success) {
        return { success: false, logs: allLogs }
      }

      // Phase 2: Users DB deletion + Firebase cleanup
      allLogs.push(createLog('🔄 Starting user record deletion...'))
      const userResult = await deleteUserData({
        userDbId: user.id,
        firebaseUserId: user.userId,
        userEmail: user.email,
        userFirstName: user.firstName,
        userLastName: user.lastName,
        callerUserId: caller.id,
        callerEmail: caller.email,
        callerFirstName: caller.firstName,
        callerLastName: caller.lastName,
        deletedJourneyIds: journeysResult.deletedJourneyIds,
        deletedTeamIds: journeysResult.deletedTeamIds,
        deletedUserJourneyIds: journeysResult.deletedUserJourneyIds,
        deletedUserTeamIds: journeysResult.deletedUserTeamIds
      })
      allLogs.push(...userResult.logs)

      return { success: userResult.success, logs: allLogs }
    }
  })
)
