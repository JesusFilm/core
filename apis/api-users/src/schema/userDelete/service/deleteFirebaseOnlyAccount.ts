import { prisma } from '@core/prisma/users/client'

import { deleteFirebaseUser } from './deleteUserData'
import { LogEntry, createLog } from './types'

interface DeleteFirebaseOnlyAccountInput {
  /** Firebase UID of the account to delete. */
  targetFirebaseUid: string
  /** Email associated with the Firebase account (used as deletion fallback). */
  targetEmail: string | null
  /** DB UUID of the caller performing the deletion. */
  callerDbId: string
  callerEmail: string | null
  /** Firebase UID of the caller (used for the self-delete guard). */
  callerFirebaseUid: string
  /** Whether the caller has superAdmin privileges. */
  callerIsSuperAdmin: boolean
}

export interface DeleteFirebaseOnlyAccountResult {
  success: boolean
  logs: LogEntry[]
}

/**
 * Delete a Firebase-only account (one that has no corresponding DB user record).
 *
 * Includes its own self-delete guard so it can be called and tested independently
 * of the parent subscription handler.
 */
export async function deleteFirebaseOnlyAccount(
  input: DeleteFirebaseOnlyAccountInput
): Promise<DeleteFirebaseOnlyAccountResult> {
  const logs: LogEntry[] = []

  // Self-delete guard: non-superAdmin callers may only delete their own account.
  if (
    !input.callerIsSuperAdmin &&
    input.targetFirebaseUid !== input.callerFirebaseUid
  ) {
    logs.push(
      createLog('❌ Forbidden: you can only delete your own account', 'error')
    )
    return { success: false, logs }
  }

  // Create audit log before deletion so there is always a durable record,
  // matching the behaviour of the full-user path.
  let auditLog: { id: string } | null = null
  try {
    auditLog = await prisma.userDeleteAuditLog.create({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: {
        deletedUserId: input.targetFirebaseUid,
        deletedUserFirebaseUid: input.targetFirebaseUid,
        callerUserId: input.callerDbId,
        callerEmail: input.callerEmail,
        deletedJourneyIds: [],
        deletedTeamIds: [],
        deletedUserJourneyIds: [],
        deletedUserTeamIds: [],
        success: false
      } as any
    })
    logs.push(createLog('📝 Audit log created'))
  } catch (auditError) {
    console.error(
      'Failed to create audit log for firebase-only deletion:',
      auditError
    )
    logs.push(
      createLog('❌ Failed to create audit log. Aborting deletion.', 'error')
    )
    return { success: false, logs }
  }

  logs.push(createLog('🔥 Deleting Firebase-only account...'))

  const fbLogs = await deleteFirebaseUser(
    input.targetFirebaseUid,
    null,
    input.targetEmail
  )
  logs.push(...fbLogs)

  const hasError = fbLogs.some((log) => log.level === 'error')

  // Best-effort audit log update
  try {
    await prisma.userDeleteAuditLog.update({
      where: { id: auditLog.id },
      data: {
        success: !hasError,
        ...(hasError ? { errorMessage: 'Firebase deletion failed' } : {})
      }
    })
  } catch (error) {
    console.warn('Best-effort operation failed:', error)
  }

  logs.push(
    createLog(
      hasError
        ? '❌ Firebase deletion failed'
        : '✅ Firebase-only account deleted successfully',
      hasError ? 'error' : 'info'
    )
  )

  return { success: !hasError, logs }
}
