import { getAuth } from 'firebase-admin/auth'

import { prisma } from '@core/prisma/users/client'
import { firebaseClient } from '@core/yoga/firebaseClient'

import { queue } from '../../workers/email/queue'

export async function validateEmail(
  userId: string,
  token: string
): Promise<boolean> {
  const job = await queue.getJob(`${userId}`)
  if (job != null && job.data.token === token) {
    await prisma.user.update({
      where: { userId },
      data: { emailVerified: true }
    })
    await getAuth(firebaseClient).updateUser(userId, {
      emailVerified: true
    })
    return true
  }
  return false
}
