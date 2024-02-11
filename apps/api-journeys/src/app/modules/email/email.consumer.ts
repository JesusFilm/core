// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { ApolloClient, InMemoryCache, gql } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { MailerService } from '@nestjs-modules/mailer'
import { render } from '@react-email/render'
import AWS, { SES } from 'aws-sdk'
import { Job } from 'bullmq'

import { Prisma } from '.prisma/api-journeys-client'
import { User } from '@core/nest/common/firebaseClient'

import {
  Journey as JourneyWithUserJourney,
  UserJourneyRole,
  UserTeamRole
} from '../../__generated__/graphql'
import { JourneyAccessRequestEmail } from '../../emails/templates/JourneyAccessRequest'
import { JourneySharedEmail } from '../../emails/templates/JourneyShared'
import { JourneySharedNoAccountEmail } from '../../emails/templates/JourneyShared/JourneySharedNoAccount'
import { TeamInviteEmail } from '../../emails/templates/TeamInvite'
import { TeamInviteNoAccountEmail } from '../../emails/templates/TeamInvite/TeamInviteNoAccount'
import { TeamInviteAcceptedEmail } from '../../emails/templates/TeamInviteAccepted'
import { TeamRemovedEmail } from '../../emails/templates/TeamRemoved'

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
  type?: string
}

export interface JourneyEditInviteJob {
  email: string
  journeyTitle: string
  url: string
  sender: Omit<User, 'id' | 'email'>
}

export interface JourneyRequestApproved {
  userId: string
  journeyTitle: string
  url: string
  sender: Omit<User, 'id' | 'email'>
}

export interface JourneyAccessRequest {
  journey: JourneyWithUserJourney
  url: string
  sender: Omit<User, 'id' | 'email'>
}

export interface TeamInviteJob {
  teamName: string
  email: string
  sender: Omit<User, 'id' | 'email'>
}

export type TeamWithUserTeam = Prisma.TeamGetPayload<{
  include: {
    userTeams: true
  }
}>
export interface TeamInviteAccepted {
  team: TeamWithUserTeam
  sender: Omit<User, 'id' | 'email'>
  url: string
}

export interface TeamRemoved {
  teamName: string
  userId: string
  sender: Omit<User, 'id' | 'email'>
}

export type ApiJourneysJob =
  | JourneyEditInviteJob
  | TeamInviteJob
  | JourneyRequestApproved
  | JourneyAccessRequest
  | TeamInviteAccepted
  | TeamRemoved

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
      case 'team-removed':
        await this.teamRemovedEmail(job as Job<TeamRemoved>)
        break
      case 'team-invite-accepted':
        await this.teamInviteAcceptedEmail(job as Job<TeamInviteAccepted>)
        break
      case 'journey-edit-invite':
        await this.journeyEditInvite(job as Job<JourneyEditInviteJob>)
        break
      case 'journey-request-approved':
        await this.journeyRequestApproved(job as Job<JourneyRequestApproved>)
        break
      case 'journey-access-request':
        await this.journeyAccessRequest(job as Job<JourneyAccessRequest>)
        break
    }
  }

  async teamRemovedEmail(job: Job<TeamRemoved>): Promise<void> {
    const { data } = await apollo.query({
      query: gql`
        query User($userId: ID!) {
          user(id: $userId) {
            id
            email
          }
        }
      `,
      variables: { userId: job.data.userId }
    })

    const html = render(
      TeamRemovedEmail({
        teamName: job.data.teamName,
        sender: job.data.sender
      }),
      {
        pretty: true
      }
    )

    const text = render(
      TeamRemovedEmail({
        teamName: job.data.teamName,
        sender: job.data.sender
      }),
      {
        plainText: true
      }
    )

    await this.sendEmail({
      to: data.user.email,
      subject: `You have been removed from team: ${job.data.teamName}`,
      text,
      html,
      type: 'teamInvites'
    })
  }

  async teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
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

    if (data.userByEmail == null) {
      const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
      const html = render(
        TeamInviteNoAccountEmail({
          teamName: job.data.teamName,
          inviteLink: url,
          sender: job.data.sender
        }),
        {
          pretty: true
        }
      )
      const text = render(
        TeamInviteNoAccountEmail({
          teamName: job.data.teamName,
          inviteLink: url,
          sender: job.data.sender
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
    } else {
      const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
      const html = render(
        TeamInviteEmail({
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
        TeamInviteEmail({
          teamName: job.data.teamName,
          email: job.data.email,
          inviteLink: url,
          sender: job.data.sender
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
  }

  async teamInviteAcceptedEmail(job: Job<TeamInviteAccepted>): Promise<void> {
    const receipientUserTeams = job.data.team.userTeams.filter(
      (userTeam) => userTeam.role === UserTeamRole.manager
    )

    const receipientEmails = await Promise.all(
      receipientUserTeams.map(async (userTeam) => {
        const { data } = await apollo.query({
          query: gql`
            query User($userId: ID!) {
              user(id: $userId) {
                id
                email
              }
            }
          `,
          variables: { userId: userTeam.userId }
        })
        return data
      })
    )

    if (receipientEmails == null || receipientEmails.length === 0) {
      throw new Error('Team Managers not found')
    }

    for (const recipient of receipientEmails) {
      const html = render(
        TeamInviteAcceptedEmail({
          teamName: job.data.team.title,
          inviteLink: job.data.url,
          sender: job.data.sender
        }),
        {
          pretty: true
        }
      )

      const text = render(
        TeamInviteAcceptedEmail({
          teamName: job.data.team.title,
          inviteLink: job.data.url,
          sender: job.data.sender
        }),
        {
          plainText: true
        }
      )

      await this.sendEmail({
        to: recipient.user.email,
        subject: `${
          job.data.sender.firstName ?? 'A new member'
        } has been added to your team`,
        text,
        html,
        type: 'teamInvites'
      })
    }
  }

  async journeyAccessRequest(job: Job<JourneyAccessRequest>): Promise<void> {
    const recipientUserId = job.data.journey.userJourneys?.find(
      (userJourney) => userJourney.role === UserJourneyRole.owner
    )?.userId

    // TODO: use this users call to check if user is subscribed to this type of email notification
    const { data } = await apollo.query({
      query: gql`
        query User($userId: ID!) {
          user(id: $userId) {
            id
            email
          }
        }
      `,
      variables: { userId: recipientUserId }
    })

    if (data.user == null) {
      throw new Error('User not found')
    }
    const html = render(
      JourneyAccessRequestEmail({
        journeyTitle: job.data.journey.title,
        inviteLink: job.data.url,
        sender: job.data.sender
      }),
      {
        pretty: true
      }
    )
    const text = render(
      JourneyAccessRequestEmail({
        journeyTitle: job.data.journey.title,
        inviteLink: job.data.url,
        sender: job.data.sender
      }),
      {
        plainText: true
      }
    )

    await this.sendEmail({
      to: data.user.email,
      subject: `${job.data.sender.firstName} requests access to a journey`,
      html,
      text,
      type: 'journeyNotifications'
    })
  }

  async journeyRequestApproved(
    job: Job<JourneyRequestApproved>
  ): Promise<void> {
    // TODO: use this users call to check if user is subscribed to this type of email notification
    const { data } = await apollo.query({
      query: gql`
        query User($userId: ID!) {
          user(id: $userId) {
            id
            email
          }
        }
      `,
      variables: { userId: job.data.userId }
    })

    if (data.user == null) {
      throw new Error('User not found')
    }

    const html = render(
      JourneySharedEmail({
        journeyTitle: job.data.journeyTitle,
        inviteLink: job.data.url,
        sender: job.data.sender
      }),
      {
        pretty: true
      }
    )

    const text = render(
      JourneySharedEmail({
        journeyTitle: job.data.journeyTitle,
        inviteLink: job.data.url,
        sender: job.data.sender
      }),
      {
        plainText: true
      }
    )
    await this.sendEmail({
      to: data.user.email,
      subject: `${job.data.journeyTitle} has been shared with you`,
      html,
      text,
      type: 'journeyNotifications'
    })
  }

  async journeyEditInvite(job: Job<JourneyEditInviteJob>): Promise<void> {
    // TODO: use this to check if user is subscribed to this type of email notification
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

    if (data.userByEmail == null) {
      const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
      const html = render(
        JourneySharedNoAccountEmail({
          sender: job.data.sender,
          journeyTitle: job.data.journeyTitle,
          inviteLink: url
        }),
        {
          pretty: true
        }
      )
      const text = render(
        JourneySharedNoAccountEmail({
          journeyTitle: job.data.journeyTitle,
          inviteLink: url,
          sender: job.data.sender
        }),
        {
          plainText: true
        }
      )
      await this.sendEmail({
        to: job.data.email,
        subject: `${job.data.journeyTitle} has been shared with you`,
        html,
        text
      })
    } else {
      const html = render(
        JourneySharedEmail({
          sender: job.data.sender,
          journeyTitle: job.data.journeyTitle,
          inviteLink: job.data.url
        }),
        {
          pretty: true
        }
      )
      const text = render(
        JourneySharedEmail({
          journeyTitle: job.data.journeyTitle,
          inviteLink: job.data.url,
          sender: job.data.sender
        }),
        {
          plainText: true
        }
      )
      await this.sendEmail({
        to: job.data.email,
        subject: `${job.data.journeyTitle} has been shared with you`,
        html,
        text
      })
    }
  }

  async sendEmail({
    to,
    subject,
    text,
    html,
    type
  }: SendEmailParams): Promise<void> {
    const { data } = await apollo.mutate({
      mutation: gql`
        mutation FindOrCreateEmailPreference($email: String!) {
          findOrCreateEmailPreference(email: $email) {
            id
            userEmail
            teamInvites
            journeyNotifications
            thirdCategory
          }
        }
      `,
      variables: { email: to }
    })

    if (type !== undefined && data.emailPreference[type] === false) {
      console.log('Email Preference in type if:', data.emailPreference)
      return
    }

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
