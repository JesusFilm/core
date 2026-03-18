import { prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { LogEntry, createLog } from './types'

interface DeleteUserDataInput {
  userDbId: string
  firebaseUserId: string
  firebaseUidOverride: string | null
  userEmail: string | null
  userFirstName: string
  userLastName: string | null
  callerUserId: string
  callerEmail: string | null
  callerFirstName: string
  callerLastName: string | null
  deletedJourneyIds: string[]
  deletedTeamIds: string[]
  deletedUserJourneyIds: string[]
  deletedUserTeamIds: string[]
}

interface DeleteUserDataResult {
  success: boolean
  logs: LogEntry[]
}

function isFirebaseNotFound(error: unknown): boolean {
  return (
    error != null &&
    typeof error === 'object' &&
    'code' in error &&
    error.code === 'auth/user-not-found'
  )
}

async function deleteFirebaseUser(
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
        const message = error instanceof Error ? error.message : 'Unknown error'
        logs.push(
          createLog(
            `❌ Failed to delete Firebase auth record (UID: ${uid}): ${message}`,
            'error'
          )
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
        const message = error instanceof Error ? error.message : 'Unknown error'
        logs.push(
          createLog(
            `❌ Failed to delete Firebase auth via email fallback: ${message}`,
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

  // 1. Delete Firebase auth record(s)
  const fbLogs = await deleteFirebaseUser(
    input.firebaseUserId,
    input.firebaseUidOverride,
    input.userEmail
  )
  logs.push(...fbLogs)

  // Check if any Firebase delete produced a hard error
  const hasFirebaseError = fbLogs.some((log) => log.level === 'error')
  if (hasFirebaseError) {
    return { success: false, logs }
  }

  // 2. Create audit log with success: false
  let auditLog: { id: string } | null = null
  try {
    auditLog = await prisma.userDeleteAuditLog.create({
      data: {
        deletedUserId: input.userDbId,
        deletedUserEmail: input.userEmail,
        deletedUserFirstName: input.userFirstName,
        deletedUserLastName: input.userLastName,
        callerUserId: input.callerUserId,
        callerEmail: input.callerEmail,
        callerFirstName: input.callerFirstName,
        callerLastName: input.callerLastName,
        deletedJourneyIds: input.deletedJourneyIds,
        deletedTeamIds: input.deletedTeamIds,
        deletedUserJourneyIds: input.deletedUserJourneyIds,
        deletedUserTeamIds: input.deletedUserTeamIds,
        success: false
      }
    })
    logs.push(createLog('📝 Audit log created'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logs.push(
      createLog(
        `❌ Failed to create audit log: ${message}. Aborting deletion.`,
        'error'
      )
    )
    return { success: false, logs }
  }

  // 3. Delete User record
  try {
    await prisma.user.delete({ where: { id: input.userDbId } })
    logs.push(createLog('🗑️ User record deleted from database'))
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    if (auditLog != null) {
      await prisma.userDeleteAuditLog.update({
        where: { id: auditLog.id },
        data: { errorMessage: `Failed to delete user record: ${message}` }
      })
    }
    logs.push(createLog(`❌ Failed to delete user record: ${message}`, 'error'))
    return { success: false, logs }
  }

  // 4. Update audit log to success
  if (auditLog != null) {
    await prisma.userDeleteAuditLog.update({
      where: { id: auditLog.id },
      data: { success: true }
    })
  }

  logs.push(createLog('✅ User deleted successfully'))
  return { success: true, logs }
}
