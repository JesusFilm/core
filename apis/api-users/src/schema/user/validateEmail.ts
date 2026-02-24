import { getAuth } from 'firebase-admin/auth'

import { prisma } from '@core/prisma/users/client'
import { firebaseClient } from '@core/yoga/firebaseClient'

import { queue } from '../../workers/email/queue'

export async function validateEmail(
  userId: string,
  userEmail: string,
  token: string
): Promise<boolean> {
  if (
    userEmail.endsWith('@example.com') &&
    token === process.env.EXAMPLE_EMAIL_TOKEN
  ) {
    await updateEmailVerified(userId)
    return true
  }

  const job = await queue.getJob(`${userId}`)
  if (job != null && job.data.token === token) {
    await updateEmailVerified(userId)
    return true
  }

  return false
}

async function updateEmailVerified(userId: string): Promise<void> {
  const auth = getAuth(firebaseClient)
  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { userId },
      data: { emailVerified: true }
    })

    await auth.updateUser(userId, {
      emailVerified: true
    })
  })
}
