import { InjectQueue } from '@nestjs/bullmq'
import { Injectable } from '@nestjs/common'
import { render } from '@react-email/render'
import { Queue } from 'bullmq'

import { Team } from '.prisma/api-journeys-client'

import { TeamInviteEmail } from '../../emails/templates/TeamInvite'
import { EmailJob } from '../email/email.consumer'

@Injectable()
export class UserTeamInviteService {
  constructor(
    @InjectQueue('api-journeys-email')
    private readonly emailQueue: Queue<EmailJob>
  ) {}

  async sendEmail(team: Team, email: string): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
    const html = render(
      TeamInviteEmail({ teamName: team.title, email, inviteLink: url }),
      {
        pretty: true
      }
    )

    const text = render(
      TeamInviteEmail({ teamName: team.title, email, inviteLink: url }),
      {
        plainText: true
      }
    )

    await this.emailQueue.add(
      'email',
      {
        email,
        subject: `Invitation to join team: ${team.title}`,
        body: html,
        text
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
