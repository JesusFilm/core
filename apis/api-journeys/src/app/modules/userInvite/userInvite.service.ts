import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'
import { Prisma } from '@core/prisma/journeys/client'

import { JourneyEditInviteJob } from '../../lib/prisma.types'

export type Journey = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: true
    primaryImageBlock: true
  }
}>

@Injectable()
export class UserInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<JourneyEditInviteJob>
  ) {}

  async sendEmail(
    journey: Journey,
    email: string,
    sender: Omit<User, 'id' | 'emailVerified'>
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-edit-invite',
      {
        email,
        url,
        journey,
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
