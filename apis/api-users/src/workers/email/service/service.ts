import { render } from '@react-email/render'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/users/client'
import { sendEmail } from '@core/yoga/email'

import { EmailVerifyEmail } from '../../../emails/templates/EmailVerify/EmailVerify'

export interface VerifyUserJob {
  userId: string
  email: string
  token: string
  redirect: string | undefined
}

export async function service(
  job: Job<VerifyUserJob>,
  logger?: Logger
): Promise<void> {
  let emailAlias: string | undefined
  if (job.data.email.includes('+'))
    emailAlias = job.data.email.replace(/\+/g, '%2B')

  let redirectParam = ''
  if (job.data.redirect != null && job.data.redirect !== '') {
    redirectParam = `&redirect=${encodeURIComponent(job.data.redirect)}`
  }

  const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/users/verify?token=${
    job.data.token
  }&email=${emailAlias ?? job.data.email}${redirectParam}`

  const user = await prisma.user.findUnique({
    where: { userId: job.data.userId }
  })

  if (user == null) return

  const recipient = {
    firstName: user.firstName ?? '',
    email: user.email ?? '',
    lastName: user.lastName ?? '',
    imageUrl: user.imageUrl ?? undefined
  }
  const html = await render(
    EmailVerifyEmail({
      token: job.data.token,
      recipient,
      inviteLink: url
    })
  )

  const text = await render(
    EmailVerifyEmail({
      token: job.data.token,
      recipient,
      inviteLink: url
    }),
    {
      plainText: true
    }
  )

  await sendEmail(
    {
      to: job.data.email,
      subject: 'Verify your email address on Next Steps',
      text,
      html
    },
    logger
  )
}
