import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { User } from '@core/nest/common/firebaseClient'

import { Team } from '../../__generated__/graphql'
import {
  TeamInviteAccepted,
  TeamInviteJob,
  TeamWithUserTeam
} from '../email/email.consumer'

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamInviteJob | TeamInviteAccepted>
  ) {}

  async sendTeamInviteEmail(
    team: Team,
    email: string,
    sender: Omit<User, 'id' | 'email'>
  ): Promise<void> {
    await this.emailQueue.add(
      'team-invite',
      {
        teamName: team.title,
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
    sender: Omit<User, 'id' | 'email'>
  ): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`

    await this.emailQueue.add(
      'team-invite-accepted',
      {
        team,
        sender,
        url
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
