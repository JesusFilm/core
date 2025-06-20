import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'

import {
  JourneyAccessRequest,
  JourneyRequestApproved,
  JourneyWithTeamAndUserJourney
} from '../../lib/prisma.types'

type OmittedUser = Omit<User, 'id' | 'emailVerified'>

@Injectable()
export class UserJourneyService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<
      JourneyRequestApproved | JourneyAccessRequest
    >
  ) {}

  async sendJourneyAccessRequest(
    journey: JourneyWithTeamAndUserJourney,
    user: OmittedUser
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-access-request',
      {
        journey,
        url,
        sender: user
      },
      {
        removeOnComplete: true,
        removeOnFail: {
          age: 24 * 3600 // keep up to 24 hours
        }
      }
    )
  }

  async sendJourneyApproveEmail(
    journey: JourneyWithTeamAndUserJourney,
    userId: string,
    user: OmittedUser
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-request-approved',
      {
        userId,
        url,
        journey,
        sender: user
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
