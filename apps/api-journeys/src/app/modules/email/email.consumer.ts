// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { MailerService } from '@nestjs-modules/mailer'
import { render } from '@react-email/render'
import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

import JourneyInviteEmail from '../../emails/JourneyInvite'
import TeamInviteEmail from '../../emails/TeamInvite'

AWS.config.update({ region: 'us-east-2' })

const apollo = new ApolloClient({
  uri: process.env.GATEWAY_URL,
  cache: new InMemoryCache(),
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? ''
  }
})

export interface SendEmailParams {
  to: string
  subject: string
  html: string
  text: string
}

export interface JourneyEditInviteJob {
  email: string
  journeyTitle: string
  url: string
}

export interface TeamInviteJob {
  teamName: string
  email: string
}

export type ApiJourneysJob = JourneyEditInviteJob | TeamInviteJob

@Processor('api-journeys-email')
export class EmailConsumer extends WorkerHost {
  constructor(private readonly mailerService: MailerService) {
    super()
  }

  async process(job: Job<ApiJourneysJob>): Promise<void> {
    switch (job.name) {
      case 'team-invite':
        await this.teamInviteEmail(job as Job<TeamInviteJob>)
        break
      case 'journey-edit-invite':
        await this.journeyEditInvite(job as Job<JourneyEditInviteJob>)
        break
    }
  }

  async teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
    const html = render(
      TeamInviteEmail({
        teamName: job.data.teamName,
        email: job.data.email,
        inviteLink: url
      }),
      {
        pretty: true
      }
    )

    const text = render(
      TeamInviteEmail({
        teamName: job.data.teamName,
        email: job.data.email,
        inviteLink: url
      }),
      {
        plainText: true
      }
    )

    await this.sendEmail({
      to: job.data.email,
      subject: `Invitation to join team: ${job.data.teamName}`,
      text,
      html
    })
  }

  async journeyEditInvite(job: Job<JourneyEditInviteJob>): Promise<void> {
    const { data } = await apollo.query({
      query: gql`
        query UserByEmail($email: String!) {
          userByEmail(email: $email) {
            id
          }
        }
      `,
      variables: { email: job.data.email }
    })
    if (data.user == null) {
      throw new Error('User not found')
    }

    const html = render(
      JourneyInviteEmail({
        email: job.data.email,
        journeyTitle: job.data.journeyTitle,
        inviteLink: job.data.url
      }),
      {
        pretty: true
      }
    )

    const text = render(
      JourneyInviteEmail({
        email: job.data.email,
        journeyTitle: job.data.journeyTitle,
        inviteLink: job.data.url
      }),
      {
        plainText: true
      }
    )
    await this.sendEmail({
      to: job.data.email,
      subject: `Invitation to edit journey: ${job.data.journeyTitle}`,
      html,
      text
    })
  }

  async sendEmail({ to, subject, text, html }: SendEmailParams): Promise<void> {
    const SMTP_URL = process.env.SMTP_URL ?? null
    if (SMTP_URL != null) {
      try {
        await this.mailerService.sendMail({
          to,
          subject,
          text,
          html
        })
      } catch (e) {
        console.log(e)
      }
    } else {
      await new SES({ region: 'us-east-2' })
        .sendEmail({
          Source: 'support@nextstep.is',
          Destination: { ToAddresses: [to] },
          Message: {
            Subject: {
              Charset: 'UTF-8',
              Data: subject
            },
            Body: {
              Html: {
                Charset: 'UTF-8',
                Data: html
              },
              Text: {
                Charset: 'UTF-8',
                Data: text
              }
            }
          }
        })
        .promise()
    }
  }
}
