import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { EmailService } from '@core/nest/common/email/emailService'

import { EmailVerifyEmail } from '../../../emails/templates/EmailVerify/EmailVerify'
import { PrismaService } from '../../lib/prisma.service'

export interface VerifyUserJob {
  userId: string
  email: string
  token: string
  redirect: string | undefined
}

export type ApiUsersJob = VerifyUserJob

@Processor('api-users-email')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
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
    let emailAlias: string | undefined
    if (job.data.email.includes('+'))
      emailAlias = job.data.email.replace(/\+/g, '%2B')

    let redirectParam = ''

    if (job.data.redirect != null) {
      if (job.data.redirect.includes('redirect')) {
        redirectParam = `&${job.data.redirect.replace(/\?/, '')}`
      } else {
        redirectParam = `&redirect=${job.data.redirect}`
      }
    }

    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/users/verify?token=${
      job.data.token
    }&email=${emailAlias ?? job.data.email}${redirectParam}`

    const user = await this.prismaService.user.findUnique({
      where: { userId: job.data.userId }
    })

    if (user == null) return

    const recipient = {
      firstName: user.firstName ?? '',
      email: user.email ?? '',
      lastName: user.lastName ?? '',
      imageUrl: user.imageUrl ?? undefined
    }
    const html = render(
      EmailVerifyEmail({
        token: job.data.token,
        recipient,
        inviteLink: url
      }),
      {
        pretty: true
      }
    )

    const text = render(
      EmailVerifyEmail({
        token: job.data.token,
        recipient,
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
