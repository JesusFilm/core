import { prisma } from '@core/prisma/users/client'

import { builder } from '../builder'

import { type LogEntry, createLog, deleteUserData, lookupUser } from './service'
import { deleteFirebaseOnlyAccount } from './service/deleteFirebaseOnlyAccount'
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
  t.withAuth({ isAuthenticated: true }).field({
    type: UserDeleteConfirmProgress,
    nullable: false,
    args: {
      idType: t.arg({ type: UserDeleteIdType, required: true }),
      id: t.arg.string({ required: true }),
      deletedJourneyIds: t.arg.stringList({ required: true }),
      deletedTeamIds: t.arg.stringList({ required: true }),
      deletedUserJourneyIds: t.arg.stringList({ required: true }),
      deletedUserTeamIds: t.arg.stringList({ required: true })
    },
    subscribe: async function* (
      _parent,
      {
        idType,
        id,
        deletedJourneyIds,
        deletedTeamIds,
        deletedUserJourneyIds,
        deletedUserTeamIds
      },
      ctx
    ) {
      try {
        const [{ user, firebase, logs: lookupLogs }, caller] =
          await Promise.all([
            lookupUser(idType, id),
            prisma.user.findUnique({ where: { userId: ctx.currentUser.id } })
          ])
        for (const log of lookupLogs) {
          yield { log, done: false, success: null }
        }
        if (caller == null) {
          yield {
            log: createLog('❌ Caller user not found', 'error'),
            done: true,
            success: false
          }
          return
        }

        // Authorization: superAdmin can delete any user; regular users can only delete themselves
        const targetUserId = user?.userId ?? firebase.uid
        if (!caller.superAdmin && targetUserId !== ctx.currentUser.id) {
          yield {
            log: createLog(
              '❌ Forbidden: you can only delete your own account',
              'error'
            ),
            done: true,
            success: false
          }
          return
        }

        // Firebase-only account — no DB user, delegate to the extracted function
        // which includes its own self-delete guard and audit logging.
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
            log: createLog('🔄 Starting Firebase-only account deletion...'),
            done: false,
            success: null
          }

          const fbOnlyResult = await deleteFirebaseOnlyAccount({
            targetFirebaseUid: firebase.uid,
            targetEmail: firebase.email,
            callerDbId: caller.id,
            callerEmail: caller.email,
            callerFirebaseUid: ctx.currentUser.id,
            callerIsSuperAdmin: caller.superAdmin
          })

          for (const log of fbOnlyResult.logs) {
            yield { log, done: false, success: null }
          }

          yield {
            log: createLog(
              fbOnlyResult.success
                ? '✅ Firebase-only account deleted successfully'
                : '❌ Firebase deletion failed',
              fbOnlyResult.success ? 'info' : 'error'
            ),
            done: true,
            success: fbOnlyResult.success
          }
          return
        }

        // Phase 2: Users DB deletion + Firebase cleanup
        yield {
          log: createLog('🔄 Starting user record deletion...'),
          done: false,
          success: null
        }

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
          deletedJourneyIds,
          deletedTeamIds,
          deletedUserJourneyIds,
          deletedUserTeamIds
        })

        for (const log of userResult.logs) {
          yield { log, done: false, success: null }
        }

        yield {
          log: createLog(
            userResult.success
              ? '✅ User deletion completed successfully'
              : '❌ User deletion failed',
            userResult.success ? 'info' : 'error'
          ),
          done: true,
          success: userResult.success
        }
      } catch (error) {
        console.error('userDeleteConfirm subscription error:', error)
        yield {
          log: createLog('❌ An internal error occurred', 'error'),
          done: true,
          success: false
        }
      }
    },
    resolve: (progress) => progress
  })
)
