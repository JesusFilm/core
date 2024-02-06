import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/emailService'

import { EmailVerifyEmail } from '../../emails/templates/EmailVerify/EmailVerify'

export interface VerifyUserJob {
  userId: string
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
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/validateEmail?token=${
      job.data.token
    }&email=${job.data.email}`

    const html = render(
      EmailVerifyEmail({
        email: job.data.email,
        inviteLink: url
      }),
      {
        pretty: true
      }
    )

    const text = render(
      EmailVerifyEmail({
        email: job.data.email,
        inviteLink: url
      }),
      {
        plainText: true
      }
    )

    await this.emailService.sendEmail({
      to: job.data.email,
      subject: 'Verify your email address on Next Steps',
      text,
      html
    })
  }
}
