import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'
import { Team } from '@core/prisma/journeys/client'

import {
  TeamInviteAccepted,
  TeamInviteJob,
  TeamWithUserTeam
} from '../../lib/prisma.types'

type SenderUser = Omit<User, 'emailVerified'>

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamInviteJob | TeamInviteAccepted>
  ) {}

  async sendTeamInviteEmail(
    team: Team,
    email: string,
    sender: SenderUser
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
    sender: SenderUser
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
