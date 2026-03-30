import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/users/client'

import { builder } from '../builder'

import {
  type LogEntry,
  callJourneysConfirm,
  createLog,
  deleteFirebaseUser,
  deleteUserData,
  lookupUser
} from './service'
import { UserDeleteIdType, UserDeleteLogEntry } from './userDeleteCheck'

interface UserDeleteConfirmProgressShape {
  log: LogEntry
  done: boolean
  success: boolean | null
}

const UserDeleteConfirmProgress =
  builder.objectRef<UserDeleteConfirmProgressShape>('UserDeleteConfirmProgress')

builder.objectType(UserDeleteConfirmProgress, {
  fields: (t) => ({
    log: t.field({
      type: UserDeleteLogEntry,
      nullable: false,
      resolve: (parent) => parent.log
    }),
    done: t.exposeBoolean('done', { nullable: false }),
    success: t.boolean({
      nullable: true,
      resolve: (parent) => parent.success
    })
  })
})

builder.subscriptionField('userDeleteConfirm', (t) =>
  t.withAuth({ isSuperAdmin: true }).field({
    type: UserDeleteConfirmProgress,
    nullable: false,
    args: {
      idType: t.arg({ type: UserDeleteIdType, required: true }),
      id: t.arg.string({ required: true })
    },
    subscribe: async function* (_parent, { idType, id }, ctx) {
      // Look up the target user (also checks Firebase status)
      const { user, firebase, logs: lookupLogs } = await lookupUser(idType, id)
      for (const log of lookupLogs) {
        yield { log, done: false, success: null }
      }

      // Firebase-only account — no DB user, just delete Firebase auth
      if (user == null) {
        if (!firebase.exists || firebase.uid == null) {
          yield {
            log: createLog('❌ No Firebase account found to delete', 'error'),
            done: true,
            success: false
          }
          return
        }

        yield {
          log: createLog('🔥 Deleting Firebase-only account...'),
          done: false,
          success: null
        }

        const fbLogs = await deleteFirebaseUser(
          firebase.uid,
          null,
          firebase.email
        )
        for (const log of fbLogs) {
          yield { log, done: false, success: null }
        }

        const hasError = fbLogs.some((log) => log.level === 'error')
        yield {
          log: createLog(
            hasError
              ? '❌ Firebase deletion failed'
              : '✅ Firebase-only account deleted successfully'
          ),
          done: true,
          success: !hasError
        }
        return
      }

      // Look up the caller (superAdmin) for audit log
      const caller = await prisma.user.findUnique({
        where: { userId: ctx.currentUser.id }
      })
      if (caller == null) {
        throw new GraphQLError('Caller user not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Phase 1: Journeys DB cleanup (via interop)
      yield {
        log: createLog('🔄 Starting journeys database cleanup...'),
        done: false,
        success: null
      }

      const journeysResult = await callJourneysConfirm(user.userId)
      for (const log of journeysResult.logs) {
        yield { log, done: false, success: null }
      }

      if (!journeysResult.success) {
        yield {
          log: createLog('❌ Journeys cleanup failed, aborting', 'error'),
          done: true,
          success: false
        }
        return
      }

      // Phase 2: Users DB deletion + Firebase cleanup
      yield {
        log: createLog('🔄 Starting user record deletion...'),
        done: false,
        success: null
      }

      // Use the Firebase UID from lookup if it differs from the DB userId
      // (e.g. email-based fallback found a different UID)
      const firebaseUidOverride =
        firebase.uid != null && firebase.uid !== user.userId
          ? firebase.uid
          : null

      const userResult = await deleteUserData({
        userDbId: user.id,
        firebaseUserId: user.userId,
        firebaseUidOverride,
        userEmail: user.email,
        callerUserId: caller.id,
        callerEmail: caller.email,
        deletedJourneyIds: journeysResult.deletedJourneyIds,
        deletedTeamIds: journeysResult.deletedTeamIds,
        deletedUserJourneyIds: journeysResult.deletedUserJourneyIds,
        deletedUserTeamIds: journeysResult.deletedUserTeamIds
      })

      for (const log of userResult.logs) {
        yield { log, done: false, success: null }
      }

      yield {
        log: createLog(
          userResult.success
            ? '✅ User deletion completed successfully'
            : '❌ User deletion failed'
        ),
        done: true,
        success: userResult.success
      }
    },
    resolve: (progress) => progress
  })
)
