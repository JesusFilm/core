import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Journey } from '.prisma/api-journeys-client'
import { Journey as JourneyWithUserJourney } from '../../__generated__/graphql'
import { User } from '@core/nest/common/firebaseClient'

import {
  JourneyAccessRequest,
  JourneyRequestApproved
} from '../email/email.consumer'

@Injectable()
export class UserJourneyService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<
      JourneyRequestApproved | JourneyAccessRequest
    >
  ) {}

  async sendJourneyAccessRequest(
    journey: JourneyWithUserJourney,
    user: Omit<User, 'id' | 'email'>
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-access-request',
      {
        journey: journey,
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
    journey: Journey,
    userId: string,
    user: Omit<User, 'id' | 'email'>
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/journeys/${journey.id}`

    await this.emailQueue.add(
      'journey-request-approved',
      {
        userId,
        url,
        journeyTitle: journey.title,
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
