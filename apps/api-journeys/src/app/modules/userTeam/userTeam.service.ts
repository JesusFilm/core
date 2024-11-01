import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { TeamRemoved } from '../../lib/prisma.types'

@Injectable()
export class UserTeamService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<TeamRemoved>
  ) {}

  async sendTeamRemovedEmail(teamName: string, userId: string): Promise<void> {
    await this.emailQueue.add(
      'team-removed',
      {
        teamName,
        userId
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
