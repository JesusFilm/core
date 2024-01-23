import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { Queue } from 'bullmq'

import { Team } from '.prisma/api-journeys-client'

import { EmailJob } from '../email/email.consumer'

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<EmailJob>
  ) {}

  async sendEmail(team: Team, email: string): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
    await this.emailQueue.add(
      'email',
      {
        email,
        subject: `Invitation to join team: ${team.title}`,
        body: `<html><body>You have been invited to join the team: ${team.title}. You can join your team at: <a href="${url}">${url}</a>.</body></html>`
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
