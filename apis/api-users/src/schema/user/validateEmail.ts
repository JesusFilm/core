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
  // This bypass is enabled when EXAMPLE_EMAIL_TOKEN is configured
  // Environment gate: requires EXAMPLE_EMAIL_TOKEN is set
  if (process.env.EXAMPLE_EMAIL_TOKEN && user?.email && token) {
    // Normalize inputs: trim and lowercase for consistent comparison
    const normalizedEmail = user.email.trim().toLowerCase()
    const normalizedToken = token.trim().toLowerCase()
    const expectedToken = process.env.EXAMPLE_EMAIL_TOKEN.trim().toLowerCase()

    if (
      normalizedEmail.endsWith('@example.com') &&
      normalizedToken === expectedToken
    ) {
      try {
        // Update Firebase first - this is the source of truth for authentication
        await getAuth(firebaseClient).updateUser(userId, {
          emailVerified: true
        })

        // Only update Prisma if Firebase update succeeds
        await prisma.user.update({
          where: { userId },
          data: { emailVerified: true }
        })

        return true
      } catch (error) {
        // If Firebase update fails, don't update Prisma
        console.error(
          'Failed to update Firebase user email verification:',
          error
        )
        return false
      }
    }
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
