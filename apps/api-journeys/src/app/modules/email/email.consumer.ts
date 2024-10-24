// code commmented out until all SES requirements for bounce, unsubscribe, GDPR met

import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { Processor, WorkerHost } from '@nestjs/bullmq'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import { Prisma } from '.prisma/api-journeys-client'
import { EmailService } from '@core/nest/common/email/emailService'
import { User } from '@core/nest/common/firebaseClient'

import { gql } from '../../../__generated__'
import {
  Team,
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
import { PrismaService } from '../../lib/prisma.service'

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

type OmittedUser = Omit<User, 'id' | 'emailVerified'>

export type JourneyWithTeamAndUserJourney = Prisma.JourneyGetPayload<{
  include: {
    userJourneys: true
    team: true
    primaryImageBlock: true
  }
}>

export interface JourneyEditInviteJob {
  email: string
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export interface JourneyRequestApproved {
  userId: string
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export interface JourneyAccessRequest {
  journey: JourneyWithTeamAndUserJourney
  url: string
  sender: OmittedUser
}

export interface TeamInviteJob {
  team: Team
  email: string
  sender: OmittedUser
}

export type TeamWithUserTeam = Prisma.TeamGetPayload<{
  include: {
    userTeams: true
  }
}>
export interface TeamInviteAccepted {
  team: TeamWithUserTeam
  sender: OmittedUser
}

export interface TeamRemoved {
  teamName: string
  userId: string
}

export type ApiJourneysJob =
  | JourneyEditInviteJob
  | TeamInviteJob
  | JourneyRequestApproved
  | JourneyAccessRequest
  | TeamInviteAccepted
  | TeamRemoved

const GET_USER = gql(`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      email
      firstName
      imageUrl
    }
  }
`)

const GET_USER_BY_EMAIL = gql(`
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      email
      firstName
      imageUrl
    }
  }
`)

@Processor('api-journeys-email')
export class EmailConsumer extends WorkerHost {
  constructor(
    private readonly emailService: EmailService,
    private readonly prismaService: PrismaService
  ) {
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
      query: GET_USER,
      variables: { userId: job.data.userId }
    })

    if (data.user == null) throw new Error('User not found')

    // check recipient preferences
    const preferences =
      await this.prismaService.journeysEmailPreference.findFirst({
        where: {
          email: data.user.email
        }
      })
    // do not send email if team removed notification is not preferred
    if (
      preferences?.accountNotifications === false ||
      preferences?.unsubscribeAll === true
    )
      return

    const html = await render(
      TeamRemovedEmail({
        teamName: job.data.teamName,
        recipient: data.user
      }),
      {
        pretty: true
      }
    )

    const text = await render(
      TeamRemovedEmail({
        teamName: job.data.teamName,
        recipient: data.user
      }),
      {
        plainText: true
      }
    )

    await this.emailService.sendEmail({
      to: data.user.email,
      subject: `You have been removed from team: ${job.data.teamName}`,
      text,
      html
    })
  }

  async teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/?activeTeam=${
      job.data.team.id
    }`
    // check recipient preferences
    const preferences =
      await this.prismaService.journeysEmailPreference.findFirst({
        where: {
          email: job.data.email
        }
      })
    // do not send email if team removed notification is not preferred
    if (
      preferences?.accountNotifications === false ||
      preferences?.unsubscribeAll === true
    )
      return

    const { data } = await apollo.query({
      query: GET_USER_BY_EMAIL,
      variables: { email: job.data.email }
    })

    if (data.userByEmail == null) {
      const html = await render(
        TeamInviteNoAccountEmail({
          teamName: job.data.team.title,
          inviteLink: url,
          sender: job.data.sender,
          recipientEmail: job.data.email
        }),
        {
          pretty: true
        }
      )
      const text = await render(
        TeamInviteNoAccountEmail({
          teamName: job.data.team.title,
          inviteLink: url,
          sender: job.data.sender,
          recipientEmail: job.data.email
        }),
        {
          plainText: true
        }
      )
      await this.emailService.sendEmail({
        to: job.data.email,
        subject: `Invitation to join team: ${job.data.team.title}`,
        text,
        html
      })
    } else {
      const html = await render(
        TeamInviteEmail({
          teamName: job.data.team.title,
          recipient: data.userByEmail,
          inviteLink: url,
          sender: job.data.sender
        }),
        {
          pretty: true
        }
      )

      const text = await render(
        TeamInviteEmail({
          teamName: job.data.team.title,
          recipient: data.userByEmail,
          inviteLink: url,
          sender: job.data.sender
        }),
        {
          plainText: true
        }
      )

      await this.emailService.sendEmail({
        to: job.data.email,
        subject: `Invitation to join team: ${job.data.team.title}`,
        text,
        html
      })
    }
  }

  async teamInviteAcceptedEmail(job: Job<TeamInviteAccepted>): Promise<void> {
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/?activeTeam=${
      job.data.team.id
    }`
    const recipientUserTeams = job.data.team.userTeams.filter(
      (userTeam) => userTeam.role === UserTeamRole.manager
    )

    const recipientEmails = await Promise.all(
      recipientUserTeams.map(async (userTeam) => {
        const { data } = await apollo.query({
          query: GET_USER,
          variables: { userId: userTeam.userId }
        })
        return data
      })
    )

    if (recipientEmails == null || recipientEmails.length === 0) {
      throw new Error('Team Managers not found')
    }

    for (const recipient of recipientEmails) {
      if (recipient.user == null) throw new Error('User not found')

      // check recipient preferences
      const preferences =
        await this.prismaService.journeysEmailPreference.findFirst({
          where: {
            email: recipient.user.email
          }
        })
      // do not send email if team removed notification is not preferred
      if (
        preferences?.accountNotifications === false ||
        preferences?.unsubscribeAll === true
      )
        return

      const html = await render(
        TeamInviteAcceptedEmail({
          teamName: job.data.team.title,
          inviteLink: url,
          sender: job.data.sender,
          recipient: recipient.user
        }),
        {
          pretty: true
        }
      )

      const text = await render(
        TeamInviteAcceptedEmail({
          teamName: job.data.team.title,
          inviteLink: url,
          sender: job.data.sender,
          recipient: recipient.user
        }),
        {
          plainText: true
        }
      )

      await this.emailService.sendEmail({
        to: recipient.user.email,
        subject: `${
          job.data.sender.firstName ?? 'A new member'
        } has been added to your team`,
        text,
        html
      })
    }
  }

  async journeyAccessRequest(job: Job<JourneyAccessRequest>): Promise<void> {
    const recipientUserId = job.data.journey.userJourneys?.find(
      (userJourney) => userJourney.role === UserJourneyRole.owner
    )?.userId

    const { data } = await apollo.query({
      query: GET_USER,
      variables: { userId: recipientUserId }
    })

    if (data.user == null) throw new Error('User not found')

    // check recipient preferences
    const preferences =
      await this.prismaService.journeysEmailPreference.findFirst({
        where: {
          email: data.user.email
        }
      })
    // do not send email if team removed notification is not preferred
    if (
      preferences?.accountNotifications === false ||
      preferences?.unsubscribeAll === true
    )
      return

    const html = await render(
      JourneyAccessRequestEmail({
        journey: job.data.journey,
        inviteLink: job.data.url,
        recipient: data.user,
        sender: job.data.sender
      }),
      {
        pretty: true
      }
    )
    const text = await render(
      JourneyAccessRequestEmail({
        journey: job.data.journey,
        inviteLink: job.data.url,
        recipient: data.user,
        sender: job.data.sender
      }),
      {
        plainText: true
      }
    )

    await this.emailService.sendEmail({
      to: data.user.email,
      subject: `${job.data.sender.firstName} requests access to a journey`,
      html,
      text
    })
  }

  async journeyRequestApproved(
    job: Job<JourneyRequestApproved>
  ): Promise<void> {
    const { data } = await apollo.query({
      query: GET_USER,
      variables: { userId: job.data.userId }
    })

    if (data.user == null) throw new Error('User not found')

    // check recipient preferences
    const preferences =
      await this.prismaService.journeysEmailPreference.findFirst({
        where: {
          email: data.user.email
        }
      })
    // do not send email if team removed notification is not preferred
    if (
      preferences?.accountNotifications === false ||
      preferences?.unsubscribeAll === true
    )
      return

    const html = await render(
      JourneySharedEmail({
        journey: job.data.journey,
        inviteLink: job.data.url,
        sender: job.data.sender,
        recipient: data.user
      }),
      {
        pretty: true
      }
    )

    const text = await render(
      JourneySharedEmail({
        journey: job.data.journey,
        inviteLink: job.data.url,
        sender: job.data.sender,
        recipient: data.user
      }),
      {
        plainText: true
      }
    )
    await this.emailService.sendEmail({
      to: data.user.email,
      subject: `${job.data.journey.title} has been shared with you`,
      html,
      text
    })
  }

  async journeyEditInvite(job: Job<JourneyEditInviteJob>): Promise<void> {
    // check recipient preferences
    const preferences =
      await this.prismaService.journeysEmailPreference.findFirst({
        where: {
          email: job.data.email
        }
      })
    // do not send email if team removed notification is not preferred
    if (
      preferences?.accountNotifications === false ||
      preferences?.unsubscribeAll === true
    )
      return

    const { data } = await apollo.query({
      query: GET_USER_BY_EMAIL,
      variables: { email: job.data.email }
    })

    if (data.userByEmail == null) {
      const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
      const html = await render(
        JourneySharedNoAccountEmail({
          sender: job.data.sender,
          journey: job.data.journey,
          inviteLink: url,
          recipientEmail: job.data.email
        }),
        {
          pretty: true
        }
      )
      const text = await render(
        JourneySharedNoAccountEmail({
          journey: job.data.journey,
          inviteLink: url,
          sender: job.data.sender,
          recipientEmail: job.data.email
        }),
        {
          plainText: true
        }
      )
      await this.emailService.sendEmail({
        to: job.data.email,
        subject: `${job.data.journey.title} has been shared with you`,
        html,
        text
      })
    } else {
      const html = await render(
        JourneySharedEmail({
          sender: job.data.sender,
          journey: job.data.journey,
          inviteLink: job.data.url,
          recipient: data.userByEmail
        }),
        {
          pretty: true
        }
      )
      const text = await render(
        JourneySharedEmail({
          journey: job.data.journey,
          inviteLink: job.data.url,
          sender: job.data.sender,
          recipient: data.userByEmail
        }),
        {
          plainText: true
        }
      )
      await this.emailService.sendEmail({
        to: job.data.email,
        subject: `${job.data.journey.title} has been shared with you on NextSteps`,
        html,
        text
      })
    }
  }
}
