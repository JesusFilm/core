import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Team } from '.prisma/api-journeys-client'
import { User } from '@core/nest/common/firebaseClient'
import {
  TeamInviteAccepted,
  TeamInviteJob,
  TeamWithUserTeam
} from '@core/yoga/email/types'

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamInviteJob | TeamInviteAccepted>
  ) {}

  async sendTeamInviteEmail(
    team: Team,
    email: string,
    sender: Omit<User, 'id' | 'emailVerified'>
  ): Promise<void> {
    await this.emailQueue.add(
      'team-invite',
      {
        team,
        email,
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

  async sendTeamInviteAcceptedEmail(
    team: TeamWithUserTeam,
    sender: Omit<User, 'id' | 'emailVerified'>
  ): Promise<void> {
    await this.emailQueue.add(
      'team-invite-accepted',
      {
        team,
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
