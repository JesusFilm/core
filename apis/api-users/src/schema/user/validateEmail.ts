import { getAuth } from 'firebase-admin/auth'

import { prisma } from '@core/prisma/users/client'
import { firebaseClient } from '@core/yoga/firebaseClient'

import { queue } from '../../workers/email/queue'

export async function validateEmail(
  userId: string,
  token: string
): Promise<boolean> {
  // Get user email to check if it's a test user
  const user = await prisma.user.findUnique({
    where: { userId },
    select: { email: true }
  })

  // Special handling for @example.com emails with EXAMPLE_EMAIL_TOKEN
  if (user?.email?.endsWith('@example.com') && token === process.env.EXAMPLE_EMAIL_TOKEN) {
    await prisma.user.update({
      where: { userId },
      data: { emailVerified: true }
    })
    await getAuth(firebaseClient).updateUser(userId, {
      emailVerified: true
    })
    return true
  }

  // Regular job-based validation for other users
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
