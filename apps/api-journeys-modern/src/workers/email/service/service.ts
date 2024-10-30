import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { render } from '@react-email/render'
import { Job } from 'bullmq'
import { graphql } from 'gql.tada'
import { Logger } from 'pino'

import { Prisma, Team } from '.prisma/api-journeys-modern-client'
import { sendEmail } from '@core/yoga/email'
import { User } from '@core/yoga/firebaseClient'

import { JourneyAccessRequestEmail } from '../../../emails/templates/JourneyAccessRequest'
import { JourneySharedEmail } from '../../../emails/templates/JourneyShared'
import { JourneySharedNoAccountEmail } from '../../../emails/templates/JourneyShared/JourneySharedNoAccount'
import { TeamInviteEmail } from '../../../emails/templates/TeamInvite'
import { TeamInviteNoAccountEmail } from '../../../emails/templates/TeamInvite/TeamInviteNoAccount'
import { TeamInviteAcceptedEmail } from '../../../emails/templates/TeamInviteAccepted'
import { TeamRemovedEmail } from '../../../emails/templates/TeamRemoved'
import { prisma } from '../../../lib/prisma'

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

export interface VerifyUserJob {
  userId: string
  email: string
  token: string
  redirect: string | undefined
}

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

const GET_USER = graphql(`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      email
      firstName
      imageUrl
    }
  }
`)

const GET_USER_BY_EMAIL = graphql(`
  query GetUserByEmail($email: String!) {
    userByEmail(email: $email) {
      id
      email
      firstName
      imageUrl
    }
  }
`)

export async function service(
  job: Job<ApiJourneysJob>,
  logger?: Logger
): Promise<void> {
  switch (job.name) {
    case 'team-invite':
      await teamInviteEmail(job as Job<TeamInviteJob>)
      break
    case 'team-removed':
      await teamRemovedEmail(job as Job<TeamRemoved>)
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

async function teamRemovedEmail(job: Job<TeamRemoved>): Promise<void> {
  const { data } = await apollo.query({
    query: GET_USER,
    variables: { userId: job.data.userId }
  })

  if (data.user == null) throw new Error('User not found')

  // check recipient preferences
  const preferences = await prisma.journeysEmailPreference.findFirst({
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

  const html = render(
    TeamRemovedEmail({
      teamName: job.data.teamName,
      recipient: data.user
    }),
    {
      pretty: true
    }
  )

  const text = render(
    TeamRemovedEmail({
      teamName: job.data.teamName,
      recipient: data.user
    }),
    {
      plainText: true
    }
  )

  await sendEmail({
    to: data.user.email,
    subject: `You have been removed from team: ${job.data.teamName}`,
    text,
    html
  })
}

async function teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
  const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/?activeTeam=${
    job.data.team.id
  }`
  // check recipient preferences
  const preferences = await prisma.journeysEmailPreference.findFirst({
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
    const html = render(
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
    const text = render(
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
    await sendEmail({
      to: job.data.email,
      subject: `Invitation to join team: ${job.data.team.title}`,
      text,
      html
    })
  } else {
    const html = render(
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

    const text = render(
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

    await sendEmail({
      to: job.data.email,
      subject: `Invitation to join team: ${job.data.team.title}`,
      text,
      html
    })
  }
}
