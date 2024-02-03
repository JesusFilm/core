import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'

import { User } from '@core/nest/common/firebaseClient'
import { JourneyEditInviteJob } from '../email/email.consumer'

@Injectable()
export class UserInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<JourneyEditInviteJob>
  ) {}

  async sendEmail(
    journey: Journey,
    email: string,
    sender: Omit<User, 'id' | 'email'>
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-edit-invite',
      {
        email,
        url,
        journeyTitle: journey.title,
        sender
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
