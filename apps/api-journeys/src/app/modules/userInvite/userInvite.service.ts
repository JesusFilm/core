import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'

import { EmailJob } from '../email/email.consumer'
import { render } from '@react-email/render'
import JourneyInviteEmail from '../../emails/JourneyInvite'

@Injectable()
export class UserInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<EmailJob>
  ) {}

  async sendEmail(journey: Journey, email: string): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`
    const html = render(
      JourneyInviteEmail({
        email: email,
        journeyTitle: journey.title,
        inviteLink: url
      }),
      {
        pretty: true
      }
    )

    const text = render(
      JourneyInviteEmail({
        email: email,
        journeyTitle: journey.title,
        inviteLink: url
      }),
      {
        plainText: true
      }
    )

    await this.emailQueue.add(
      'email',
      {
        email,
        subject: `Invitation to edit journey: ${journey.title}`,
        text,
        body: html
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
