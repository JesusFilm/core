import { prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { LogEntry, createLog, isFirebaseNotFound } from './types'

interface DeleteUserDataInput {
  userDbId: string
  firebaseUserId: string
  firebaseUidOverride: string | null
  userEmail: string | null
  callerUserId: string
  callerEmail: string | null
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
}

interface DeleteUserDataResult {
  success: boolean
  logs: LogEntry[]
}

export async function deleteFirebaseUser(
  firebaseUserId: string,
  firebaseUidOverride: string | null,
  email: string | null
): Promise<LogEntry[]> {
  const logs: LogEntry[] = []
  const uidsToTry = new Set<string>()

  // Primary UID from the DB
  uidsToTry.add(firebaseUserId)

  // Override UID from the lookup's email-based Firebase check
  if (firebaseUidOverride != null) {
    uidsToTry.add(firebaseUidOverride)
  }

  let anyDeleted = false

  for (const uid of uidsToTry) {
    try {
      await auth.deleteUser(uid)
      logs.push(createLog(`🔥 Firebase auth record deleted (UID: ${uid})`))
      anyDeleted = true
    } catch (error) {
      if (isFirebaseNotFound(error)) {
        logs.push(createLog(`⚠️ No Firebase auth record for UID: ${uid}`))
      } else {
        console.error(`Failed to delete Firebase auth (UID: ${uid}):`, error)
        logs.push(
          createLog('❌ Failed to delete Firebase auth record', 'error')
        )
        return logs
      }
    }
  }

  // Final safety check: if nothing was deleted by UID, try by email
  if (!anyDeleted && email != null) {
    try {
      const fbUser = await auth.getUserByEmail(email)
      await auth.deleteUser(fbUser.uid)
      logs.push(
        createLog(
          `🔥 Firebase auth record deleted via email fallback (UID: ${fbUser.uid})`
        )
      )
    } catch (error) {
      if (isFirebaseNotFound(error)) {
        logs.push(createLog('🔥 No Firebase auth record found by email either'))
      } else {
        console.error(
          'Failed to delete Firebase auth via email fallback:',
          error
        )
        logs.push(
          createLog(
            '❌ Failed to delete Firebase auth via email fallback',
            'error'
          )
        )
        return logs
      }
    }
  }

  return logs
}

export async function deleteUserData(
  input: DeleteUserDataInput
): Promise<DeleteUserDataResult> {
  const logs: LogEntry[] = []

  // Create audit log FIRST — before any irreversible action so there is
  // always a durable record of the deletion attempt even if a subsequent
  // step fails.
  let auditLog: { id: string } | null = null
  try {
    auditLog = await prisma.userDeleteAuditLog.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        deletedUserId: input.userDbId,
        deletedUserFirebaseUid: input.firebaseUserId,
        callerUserId: input.callerUserId,
        callerEmail: input.callerEmail,
        deletedJourneyIds: input.deletedJourneyIds,
        deletedTeamIds: input.deletedTeamIds,
        deletedUserJourneyIds: input.deletedUserJourneyIds,
        deletedUserTeamIds: input.deletedUserTeamIds,
        success: false
      } as any
    })
    logs.push(createLog('📝 Audit log created'))
  } catch (error) {
    console.error('Failed to create audit log:', error)
    logs.push(
      createLog('❌ Failed to create audit log. Aborting deletion.', 'error')
    )
    return { success: false, logs }
  }

  // 2. Delete DB user record FIRST.
  // Ordering rationale: deleting the DB record before Firebase means that if
  // Firebase deletion subsequently fails, the user no longer exists in the DB
  // and a retry will take the firebase-only path, which handles removing the
  // orphaned Firebase auth record cleanly. The reverse order (Firebase first)
  // would leave a dangling DB record if Firebase succeeded but DB deletion
  // failed, which is harder to recover from.
  try {
    await prisma.user.delete({ where: { id: input.userDbId } })
    logs.push(createLog('🗑️ User record deleted from database'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    // Best-effort update — don't let an audit log write failure mask the
    // real error or report the deletion as failed twice.
    try {
      await prisma.userDeleteAuditLog.update({
        where: { id: auditLog.id },
        data: { errorMessage: `Failed to delete user record: ${message}` }
      })
    } catch (auditError) {
      console.warn('Best-effort operation failed:', auditError)
    }
    console.error('Failed to delete user record:', error)
    logs.push(createLog('❌ Failed to delete user record', 'error'))
    return { success: false, logs }
  }

  // 3. Delete Firebase auth record(s)
  const fbLogs = await deleteFirebaseUser(
    input.firebaseUserId,
    input.firebaseUidOverride,
    input.userEmail
  )
  logs.push(...fbLogs)

  const hasFirebaseError = fbLogs.some((log) => log.level === 'error')
  if (hasFirebaseError) {
    // DB record is already deleted. Firebase auth still exists — a retry will
    // look up the account, find no DB user, and take the firebase-only path
    // which handles the orphaned Firebase auth record.
    try {
      await prisma.userDeleteAuditLog.update({
        where: { id: auditLog.id },
        data: {
          errorMessage:
            'Firebase deletion failed after DB delete (DB record deleted)'
        }
      })
    } catch (auditError) {
      console.warn('Best-effort operation failed:', auditError)
    }
    return { success: false, logs }
  }

  // Update audit log to success (best-effort — user is already deleted;
  // a transient write failure here must not surface as a deletion failure).
  try {
    await prisma.userDeleteAuditLog.update({
      where: { id: auditLog.id },
      data: { success: true }
    })
  } catch (error) {
    console.error('Failed to update audit log to success:', error)
  }

  logs.push(createLog('✅ User deleted successfully'))
  return { success: true, logs }
}
