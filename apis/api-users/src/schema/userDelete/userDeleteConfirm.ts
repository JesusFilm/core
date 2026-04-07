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

          // Create audit log before deletion so there is always a durable
          // record, matching the behaviour of the full-user path.
          let auditLog: { id: string } | null = null
          try {
            auditLog = await prisma.userDeleteAuditLog.create({
              data: {
                deletedUserId: firebase.uid,
                callerUserId: caller.id,
                callerEmail: caller.email,
                deletedJourneyIds: [],
                deletedTeamIds: [],
                deletedUserJourneyIds: [],
                deletedUserTeamIds: [],
                success: false
              }
            })
            yield {
              log: createLog('📝 Audit log created'),
              done: false,
              success: null
            }
          } catch (auditError) {
            console.error(
              'Failed to create audit log for firebase-only deletion:',
              auditError
            )
            yield {
              log: createLog(
                '❌ Failed to create audit log. Aborting deletion.',
                'error'
              ),
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

          // Best-effort audit log update
          try {
            await prisma.userDeleteAuditLog.update({
              where: { id: auditLog.id },
              data: {
                success: !hasError,
                ...(hasError
                  ? { errorMessage: 'Firebase deletion failed' }
                  : {})
              }
            })
          } catch {
            // best-effort
          }

          yield {
            log: createLog(
              hasError
                ? '❌ Firebase deletion failed'
                : '✅ Firebase-only account deleted successfully',
              hasError ? 'error' : 'info'
            ),
            done: true,
            success: !hasError
          }
          return
        }

        // Prevent self-deletion
        if (user.userId === ctx.currentUser.id) {
          yield {
            log: createLog('❌ Cannot delete your own account', 'error'),
            done: true,
            success: false
          }
          return
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
              : '❌ User deletion failed',
            userResult.success ? 'info' : 'error'
          ),
          done: true,
          success: userResult.success
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('userDeleteConfirm subscription error:', error)
        yield {
          log: createLog(`❌ Unexpected error: ${message}`, 'error'),
          done: true,
          success: false
        }
      }
    },
    resolve: (progress) => progress
  })
)
