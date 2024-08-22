import { getAuth } from 'firebase-admin/auth'

import { firebaseClient } from '@core/yoga/firebaseClient'

export async function validateEmail(
  userId: string,
  token: string
): Promise<boolean> {
  const job = await this.emailQueue.getJob(`${userId}`)
  if (job != null && job.data.token === token) {
    await this.prismaService.user.update({
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
