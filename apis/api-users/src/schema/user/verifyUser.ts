import crypto from 'crypto'

import { queue } from '../../workers/email/queue'

import { type AppType } from './enums/app'

export function generateSixDigitNumber(): string {
  return crypto.randomInt(100000, 999999).toString()
}

export async function verifyUser(
  userId: string,
  email: string,
  redirect?: string,
  app?: AppType | undefined
): Promise<void> {
  const isExample = email.endsWith('@example.com')
  const token = isExample
    ? (process.env.EXAMPLE_EMAIL_TOKEN ?? generateSixDigitNumber()) // Use random token if EXAMPLE_EMAIL_TOKEN not set
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
        redirect,
        app
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
        redirect,
        app
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
