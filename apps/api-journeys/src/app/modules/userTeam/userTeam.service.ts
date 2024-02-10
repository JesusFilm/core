import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'

// import { Team } from '../../__generated__/graphql'
import { TeamRemoved } from '../email/email.consumer'

@Injectable()
export class UserTeamService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamRemoved>
  ) {}

  async sendTeamRemovedEmail(
    teamName: string,
    userId: string,
    sender: Omit<User, 'id' | 'email' | 'emailVerified'>
  ): Promise<void> {
    await this.emailQueue.add(
      'team-removed',
      {
        teamName,
        userId,
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
