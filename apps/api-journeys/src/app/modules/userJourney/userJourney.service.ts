import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'

export interface ApiUserEmailJob {
  userId: string
  subject: string
  body: string
}

@Injectable()
export class UserJourneyService {
  constructor(
    @InjectQueue('api-users-email')
    private readonly emailQueue: Queue<ApiUserEmailJob>
  ) {}

  async sendEmail(journey: Journey, userId: string): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'email',
      {
        userId,
        subject: `Access to edit journey: ${journey.title}`,
        body: `<html><body>You have been granted access to edit the journey: ${journey.title}. You can find the journey at: <a href="${url}">${url}</a>.</body></html>`
      },
      {
        removeOnComplete: true,
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  }
}
