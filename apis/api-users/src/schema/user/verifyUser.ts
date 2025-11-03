import crypto from 'crypto'

import { queue } from '../../workers/email/queue'

export function generateSixDigitNumber(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function verifyUser(
  userId: string,
  email: string,
  redirect?: string
): Promise<void> {
  const isExample = email.endsWith('@example.com')
  const token = isExample
    ? (process.env.EXAMPLE_EMAIL_TOKEN ?? '')
    : generateSixDigitNumber()

  const job = await queue.getJob(userId)
  if (job != null) {
    await job.remove()
    await queue.add(
      'verifyUser',
      {
        userId,
        email,
        token,
        redirect
      },
      {
        jobId: userId,
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  } else {
    await queue.add(
      'verifyUser',
      {
        userId,
        email,
        token,
        redirect
      },
      {
        jobId: userId,
        removeOnComplete: {
          age: 24 * 3600 // keep up to 24 hours
        },
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  }
}
