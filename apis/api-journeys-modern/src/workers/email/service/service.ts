import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { render } from '@react-email/render'
import { Job } from 'bullmq'

import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'
import { graphql } from '@core/shared/gql'
import { sendEmail } from '@core/yoga/email'

import { JourneyAccessRequestEmail } from '../../../emails/templates/JourneyAccessRequest'
import { JourneySharedEmail } from '../../../emails/templates/JourneyShared'
import { JourneySharedNoAccountEmail } from '../../../emails/templates/JourneyShared/JourneySharedNoAccount'
import { TeamInviteEmail } from '../../../emails/templates/TeamInvite'
import { TeamInviteNoAccountEmail } from '../../../emails/templates/TeamInvite/TeamInviteNoAccount'
import { TeamInviteAcceptedEmail } from '../../../emails/templates/TeamInviteAccepted'
import { TeamRemovedEmail } from '../../../emails/templates/TeamRemoved'
import { logger } from '../../../logger'

import {
  ApiJourneysJob,
  JourneyAccessRequest,
  JourneyEditInviteJob,
  JourneyRequestApproved,
  TeamInviteAccepted,
  TeamInviteJob,
  TeamRemoved
} from './prisma.types'

const httpLink = createHttpLink({
  uri: process.env.GATEWAY_URL,
  headers: {
    'interop-token': process.env.INTEROP_TOKEN ?? '',
    'x-graphql-client-name': 'api-journeys-modern',
    'x-graphql-client-version': process.env.SERVICE_VERSION ?? ''
  }
})

const apollo = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache()
})

const GET_USER = graphql(`
  query GetUser($userId: ID!) {
    user(id: $userId) {
      id
      email
      firstName
      lastName
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

type SenderInfo = {
  id: string
  firstName: string
  lastName?: string
  email?: string
  imageUrl?: string
}

/**
 * Fetch complete sender information. Returns empty fields if database call fails.
 */
async function fetchSenderData(senderId: string): Promise<SenderInfo> {
  try {
    const result = await apollo.query({
      query: GET_USER,
      variables: { userId: senderId }
    })

    if (!result?.data?.user) {
      return {
        id: senderId,
        firstName: '',
        lastName: undefined,
        email: undefined,
        imageUrl: undefined
      }
    }

    const user = result.data.user
    const firstName = user.firstName?.trim() || ''
    const email = user.email

    if (!firstName || firstName === '') {
      logger?.warn('Sender data missing firstName', {
        senderId
      })
    }

    if (!email) {
      logger?.warn('Sender data missing email', {
        senderId
      })
    }

    return {
      id: senderId,
      firstName,
      lastName: user.lastName ?? undefined,
      email,
      imageUrl: user.imageUrl ?? undefined
    }
  } catch {
    return {
      id: senderId,
      firstName: '',
      lastName: undefined,
      email: undefined,
      imageUrl: undefined
    }
  }
}

export async function service(job: Job<ApiJourneysJob>): Promise<void> {
  switch (job.name) {
    case 'team-invite':
      await teamInviteEmail(job as Job<TeamInviteJob>)
      break
    case 'team-removed':
      await teamRemovedEmail(job as Job<TeamRemoved>)
      break
    case 'team-invite-accepted':
      await teamInviteAcceptedEmail(job as Job<TeamInviteAccepted>)
      break
    case 'journey-edit-invite':
      await journeyEditInvite(job as Job<JourneyEditInviteJob>)
      break
    case 'journey-request-approved':
      await journeyRequestApproved(job as Job<JourneyRequestApproved>)
      break
    case 'journey-access-request':
      await journeyAccessRequest(job as Job<JourneyAccessRequest>)
      break
  }
}

export async function teamRemovedEmail(job: Job<TeamRemoved>): Promise<void> {
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

  const recipient = {
    firstName: data.user.firstName,
    lastName: data.user.lastName ?? undefined,
    email: data.user.email,
    imageUrl: data.user.imageUrl ?? undefined
  }

  const html = await render(
    TeamRemovedEmail({
      teamName: job.data.teamName,
      recipient
    })
  )

  const text = await render(
    TeamRemovedEmail({
      teamName: job.data.teamName,
      recipient
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

export async function teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
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

  // Fetch complete sender data from database
  const sender: SenderInfo = await fetchSenderData(job.data.sender.id)
  // Cannot send email without sender email
  if (!sender.email) return

  const { data } = await apollo.query({
    query: GET_USER_BY_EMAIL,
    variables: { email: job.data.email }
  })

  if (data.userByEmail == null) {
    const html = await render(
      TeamInviteNoAccountEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender,
        recipientEmail: job.data.email
      })
    )
    const text = await render(
      TeamInviteNoAccountEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender,
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
    const html = await render(
      TeamInviteEmail({
        teamName: job.data.team.title,
        recipient: data.userByEmail,
        inviteLink: url,
        sender
      })
    )

    const text = await render(
      TeamInviteEmail({
        teamName: job.data.team.title,
        recipient: data.userByEmail,
        inviteLink: url,
        sender
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

export async function teamInviteAcceptedEmail(
  job: Job<TeamInviteAccepted>
): Promise<void> {
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

  // Fetch complete sender data from database
  const sender = await fetchSenderData(job.data.sender.id)

  // Cannot send email without sender email
  if (!sender.email) return

  for (const recipient of recipientEmails) {
    if (recipient.user == null) throw new Error('User not found')

    // check recipient preferences
    const preferences = await prisma.journeysEmailPreference.findFirst({
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

    const recipientUser = {
      firstName: recipient.user.firstName,
      lastName: recipient.user.lastName ?? undefined,
      email: recipient.user.email,
      imageUrl: recipient.user.imageUrl ?? undefined
    }

    const html = await render(
      TeamInviteAcceptedEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender,
        recipient: recipientUser
      })
    )

    const text = await render(
      TeamInviteAcceptedEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender,
        recipient: recipientUser
      }),
      {
        plainText: true
      }
    )

    await sendEmail({
      to: recipient.user.email,
      subject: `${
        sender.firstName ?? 'A new member'
      } has been added to your team`,
      text,
      html
    })
  }
}

export async function journeyAccessRequest(
  job: Job<JourneyAccessRequest>
): Promise<void> {
  const recipientUserId = job.data.journey.userJourneys?.find(
    (userJourney) => userJourney.role === UserJourneyRole.owner
  )?.userId

  if (recipientUserId == null) throw new Error('User not found')

  const { data } = await apollo.query({
    query: GET_USER,
    variables: { userId: recipientUserId }
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

  const recipient = {
    firstName: data.user.firstName,
    lastName: data.user.lastName ?? undefined,
    email: data.user.email,
    imageUrl: data.user.imageUrl ?? undefined
  }

  const html = await render(
    JourneyAccessRequestEmail({
      journey: job.data.journey,
      inviteLink: job.data.url,
      recipient,
      sender: job.data.sender
    })
  )
  const text = await render(
    JourneyAccessRequestEmail({
      journey: job.data.journey,
      inviteLink: job.data.url,
      recipient,
      sender: job.data.sender
    }),
    {
      plainText: true
    }
  )

  await sendEmail({
    to: data.user.email,
    subject: `${job.data.sender.firstName} requests access to a journey`,
    html,
    text
  })
}

export async function journeyRequestApproved(
  job: Job<JourneyRequestApproved>
): Promise<void> {
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

  const recipient = {
    firstName: data.user.firstName,
    lastName: data.user.lastName ?? undefined,
    email: data.user.email,
    imageUrl: data.user.imageUrl ?? undefined
  }

  const html = await render(
    JourneySharedEmail({
      journey: job.data.journey,
      inviteLink: job.data.url,
      sender: job.data.sender,
      recipient
    })
  )

  const text = await render(
    JourneySharedEmail({
      journey: job.data.journey,
      inviteLink: job.data.url,
      sender: job.data.sender,
      recipient
    }),
    {
      plainText: true
    }
  )
  await sendEmail({
    to: data.user.email,
    subject: `${job.data.journey.title} has been shared with you`,
    html,
    text
  })
}

export async function journeyEditInvite(
  job: Job<JourneyEditInviteJob>
): Promise<void> {
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
    const url = `${process.env.JOURNEYS_ADMIN_URL ?? ''}/`
    const html = await render(
      JourneySharedNoAccountEmail({
        sender: job.data.sender,
        journey: job.data.journey,
        inviteLink: url,
        recipientEmail: job.data.email
      })
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
    await sendEmail({
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
      })
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
    await sendEmail({
      to: job.data.email,
      subject: `${job.data.journey.title} has been shared with you on NextSteps`,
      html,
      text
    })
  }
}
