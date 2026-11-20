import { prisma } from '@core/prisma/users/client'
import { auth } from '@core/yoga/firebaseClient'

import { deleteFirebaseUser } from './deleteUserData'
import { type LogEntry, createLog } from './types'

/** Resume only server-recorded retirement after the owning SQL delete committed. */
export async function resumeUserDeletion(
  idType: 'databaseId' | 'email' | 'jwt',
  id: string,
  callerFirebaseUid: string
): Promise<{ success: boolean; logs: LogEntry[] } | null> {
  const caller = await prisma.user.findUnique({
    where: { userId: callerFirebaseUid }
  })
  let targetUid: string | undefined
  if (idType === 'jwt') targetUid = (await auth.verifyIdToken(id)).uid
  if (idType === 'email' && caller?.superAdmin) return null
  const progress = await prisma.userDeleteAuditLog.findFirst({
    where: {
      success: false,
      retiredFirebaseUids: { isEmpty: false },
      ...(idType === 'databaseId'
        ? { deletedUserId: id }
        : idType === 'jwt'
          ? { deletedUserFirebaseUid: targetUid }
          : { deletedUserFirebaseUid: callerFirebaseUid, callerEmail: id })
    },
    orderBy: { createdAt: 'desc' }
  })
  if (!progress?.deletedUserFirebaseUid) return null
  const selfDeletion =
    progress.deletedUserFirebaseUid === callerFirebaseUid &&
    progress.callerUserId === progress.deletedUserId
  if (!caller?.superAdmin && !selfDeletion) return null
  if (!progress.retiredFirebaseUids.includes(progress.deletedUserFirebaseUid))
    return null
  const remainingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { id: progress.deletedUserId },
        { userId: { in: progress.retiredFirebaseUids } }
      ]
    }
  })
  if (remainingUser) return null
  const retiredUids = caller?.superAdmin
    ? progress.retiredFirebaseUids
    : [callerFirebaseUid]
  const logs = await deleteFirebaseUser(
    progress.deletedUserFirebaseUid,
    retiredUids.find((uid) => uid !== progress.deletedUserFirebaseUid) ?? null,
    selfDeletion ? progress.callerEmail : null,
    caller?.superAdmin ?? false,
    new Set(retiredUids)
  )
  const success = !logs.some(({ level }) => level === 'error')
  await prisma.userDeleteAuditLog.update({
    where: { id: progress.id },
    data: {
      success,
      ...(success
        ? { completedAt: new Date(), errorMessage: null }
        : { errorMessage: 'Firebase deletion pending after SQL deletion' })
    }
  })
  logs.push(
    createLog(success ? 'User deletion completed' : 'Firebase deletion pending')
  )
  return { success, logs }
}
