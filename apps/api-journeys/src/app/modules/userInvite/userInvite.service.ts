import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'

import { EmailJob } from '../email/email.consumer'

@Injectable()
export class UserInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<EmailJob>
  ) {}

  async sendEmail(journey: Journey, email: string): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`
    await this.emailQueue.add(
      'email',
      {
        email,
        subject: `Invitation to edit journey: ${journey.title}`,
        body: `<html><body>You have been invited to edit the journey: ${journey.title}. You can find the journey at: <a href="${url}">${url}</a>.</body></html>`
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
