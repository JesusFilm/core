import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/emailService'
import { User } from '@core/nest/common/firebaseClient'

import { VerifyEmailEmail } from '../../emails/EmailVerify'

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

export interface VerifyUserJob {
  userid: string
  email: string
  token: string
}

export type ApiUsersJob = VerifyUserJob

@Processor('api-users-email')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly emailService: EmailService) {
    super()
  }

  async process(job: Job<ApiUsersJob>): Promise<void> {
    switch (job.name) {
      case 'verifyUser':
        await this.verifyUser(job)
        break
    }
  }

  async verifyUser(job: Job<VerifyUserJob>): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
    const html = render(
      VerifyEmailEmail({
        teamName: job.data.teamName,
        email: job.data.email,
        inviteLink: url,
        sender: job.data.sender
      }),
      {
        pretty: true
      }
    )

    const text = render(
      VerifyEmailEmail({
        teamName: job.data.teamName,
        email: job.data.email,
        inviteLink: url,
        sender: job.data.sender
      }),
      {
        plainText: true
      }
    )

    await this.emailService.sendEmail({
      to: job.data.email,
      subject: `Invitation to join team: ${job.data.teamName}`,
      text,
      html
    })
  }
}
