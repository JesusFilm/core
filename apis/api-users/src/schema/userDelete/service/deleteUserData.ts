import { prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { LogEntry, createLog } from './types'

interface DeleteUserDataInput {
  userDbId: string
  firebaseUserId: string
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

export async function deleteUserData(
  input: DeleteUserDataInput
): Promise<DeleteUserDataResult> {
  const logs: LogEntry[] = []

  // 1. Delete Firebase auth record first
  try {
    await auth.deleteUser(input.firebaseUserId)
    logs.push(createLog('🔥 Firebase auth record deleted'))
  } catch (error) {
    // auth/user-not-found means no Firebase record exists — safe to proceed
    if (
      error != null &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'auth/user-not-found'
    ) {
      logs.push(createLog('⚠️ No Firebase auth record found, proceeding'))
    } else {
      const message = error instanceof Error ? error.message : 'Unknown error'
      logs.push(
        createLog(
          `❌ Failed to delete Firebase auth record: ${message}`,
          'error'
        )
      )
      return { success: false, logs }
    }
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
