import { render } from '@react-email/render'
import { Job } from 'bullmq'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/users/client'
import { sendEmail } from '@core/yoga/email'

import { EmailVerifyEmail } from '../../../emails/templates/EmailVerifyEmail'
import { EmailVerifyNextSteps } from '../../../emails/templates/EmailVerifyNextSteps'
import { AppType } from '../../../schema/user/enums/app'

export interface VerifyUserJob {
  userId: string
  email: string
  token: string
  redirect: string | undefined
  app?: AppType
}

export async function service(
  job: Job<VerifyUserJob>,
  logger?: Logger,
  app?: AppType
): Promise<void> {
  let emailAlias: string | undefined
  if (job.data.email.includes('+'))
    emailAlias = job.data.email.replace(/\+/g, '%2B')

  let redirectParam = ''
  if (job.data.redirect != null && job.data.redirect !== '') {
    redirectParam = `&redirect=${encodeURIComponent(job.data.redirect)}`
  }

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

  let from: string | undefined
  let subject: string | undefined
  let url: string | undefined
  let text: string | undefined
  let html: string | undefined

  switch (job.data?.app ?? 'NextSteps') {
    case 'JFPOne':
      from = '"Jesus Film Project" <no-reply@jesusfilm.org>'
      subject = 'Verify your email address with the Jesus Film Project'
      url = `${process.env.JESUS_FILM_PROJECT_VERIFY_URL ?? ''}?token=${job.data.token}&email=${emailAlias ?? job.data.email}`
      html = await render(
        EmailVerifyEmail({
          token: job.data.token,
          recipient,
          inviteLink: url
        })
      )
      text = await render(
        EmailVerifyEmail({
          token: job.data.token,
          recipient,
          inviteLink: url
        }),
        { plainText: true }
      )
      break
    case 'NextSteps':
      from = '"Next Steps Support" <support@nextstep.is>'
      subject = 'Verify your email address on Next Steps'
      url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/users/verify?token=${job.data.token}&email=${emailAlias ?? job.data.email}${redirectParam}`
      html = await render(
        EmailVerifyNextSteps({
          token: job.data.token,
          recipient,
          inviteLink: url
        })
      )
      text = await render(
        EmailVerifyNextSteps({
          token: job.data.token,
          recipient,
          inviteLink: url
        }),
        { plainText: true }
      )
      break
  }

  await sendEmail(
    {
      to: job.data.email,
      subject,
      text,
      html,
      from
    },
    logger
  )
}
