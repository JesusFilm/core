import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Team } from '.prisma/api-journeys-client'

import { TeamInviteJob } from '../email/email.consumer'

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamInviteJob>
  ) {}

  async sendEmail(team: Team, email: string): Promise<void> {
    await this.emailQueue.add(
      'team-invite',
      {
        teamName: team.title,
        email
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
