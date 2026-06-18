import { render } from '@react-email/render'
import { Job } from 'bullmq'

import {
  UserJourneyRole,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'
import { prisma as prismaUsers } from '@core/prisma/users/client'
import { sendEmail } from '@core/yoga/email'

import { JourneyAccessRequestEmail } from '../../../emails/templates/JourneyAccessRequest'
import { JourneySharedEmail } from '../../../emails/templates/JourneyShared'
import { JourneySharedNoAccountEmail } from '../../../emails/templates/JourneyShared/JourneySharedNoAccount'
import { TeamInviteEmail } from '../../../emails/templates/TeamInvite'
import { TeamInviteNoAccountEmail } from '../../../emails/templates/TeamInvite/TeamInviteNoAccount'
import { TeamInviteAcceptedEmail } from '../../../emails/templates/TeamInviteAccepted'
import { TeamRemovedEmail } from '../../../emails/templates/TeamRemoved'
import { env } from '../../../env'

import {
  ApiJourneysJob,
  JourneyAccessRequest,
  JourneyEditInviteJob,
  JourneyRequestApproved,
  TeamInviteAccepted,
  TeamInviteJob,
  TeamRemoved
} from './prisma.types'

export interface EmailRecipient {
  firstName: string
  lastName?: string
  email: string
  imageUrl?: string | null
}

function toEmailRecipient(user: {
  firstName: string
  lastName?: string | null
  email?: string | null
  imageUrl?: string | null
}): EmailRecipient | null {
  if (user.email == null) return null
  return {
    firstName: user.firstName,
    lastName: user.lastName ?? undefined,
    email: user.email,
    imageUrl: user.imageUrl
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
  const recipientUser = await prismaUsers.user.findUnique({
    where: { userId: job.data.userId }
  })

  if (recipientUser == null) throw new Error('User not found')
  const recipient = toEmailRecipient(recipientUser)
  if (recipient == null) throw new Error('User has no email')

  // check recipient preferences
  const preferences = await prisma.journeysEmailPreference.findFirst({
    where: {
      email: recipient.email
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
    to: recipient.email,
    subject: `You have been removed from team: ${job.data.teamName}`,
    text,
    html
  })
}

export async function teamInviteEmail(job: Job<TeamInviteJob>): Promise<void> {
  const url = `${env.JOURNEYS_ADMIN_URL}/?activeTeam=${job.data.team.id}`
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

  const recipientUser = await prismaUsers.user.findUnique({
    where: { email: job.data.email }
  })

  if (recipientUser == null) {
    const html = await render(
      TeamInviteNoAccountEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender: job.data.sender,
        recipientEmail: job.data.email
      })
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
    await sendEmail({
      to: job.data.email,
      subject: `Invitation to join team: ${job.data.team.title}`,
      text,
      html
    })
  } else {
    const recipient = toEmailRecipient(recipientUser)
    if (recipient == null) throw new Error('User has no email')

    const html = await render(
      TeamInviteEmail({
        teamName: job.data.team.title,
        recipient,
        inviteLink: url,
        sender: job.data.sender
      })
    )

    const text = await render(
      TeamInviteEmail({
        teamName: job.data.team.title,
        recipient,
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

export async function teamInviteAcceptedEmail(
  job: Job<TeamInviteAccepted>
): Promise<void> {
  const url = `${env.JOURNEYS_ADMIN_URL}/?activeTeam=${job.data.team.id}`
  const recipientUserTeams = job.data.team.userTeams.filter(
    (userTeam) => userTeam.role === UserTeamRole.manager
  )
  const recipientUserIds = recipientUserTeams.map((userTeam) => userTeam.userId)

  const recipientUsers = await prismaUsers.user.findMany({
    where: {
      userId: {
        in: recipientUserIds
      }
    }
  })

  const recipientUsersByUserId = new Map(
    recipientUsers.map((user) => {
      const recipient = toEmailRecipient(user)
      if (recipient == null) throw new Error('User has no email')
      return [user.userId, recipient] as const
    })
  )

  if (recipientUserIds.length === 0) {
    throw new Error('Team Managers not found')
  }

  const missingIds = recipientUserIds.filter(
    (id) => !recipientUsersByUserId.has(id)
  )
  if (missingIds.length > 0) {
    throw new Error(
      `Team Managers not found for userIds: ${missingIds.join(', ')}`
    )
  }

  const recipients = recipientUserIds.map(
    (userId) => recipientUsersByUserId.get(userId)!
  )

  for (const recipient of recipients) {
    // check recipient preferences
    const preferences = await prisma.journeysEmailPreference.findFirst({
      where: {
        email: recipient.email
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
        recipient
      })
    )

    const text = await render(
      TeamInviteAcceptedEmail({
        teamName: job.data.team.title,
        inviteLink: url,
        sender: job.data.sender,
        recipient
      }),
      {
        plainText: true
      }
    )

    await sendEmail({
      to: recipient.email,
      subject: `${
        job.data.sender.firstName ?? 'A new member'
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

  const recipientUser = await prismaUsers.user.findUnique({
    where: { userId: recipientUserId }
  })

  if (recipientUser == null) throw new Error('User not found')
  const recipient = toEmailRecipient(recipientUser)
  if (recipient == null) throw new Error('User has no email')

  // check recipient preferences
  const preferences = await prisma.journeysEmailPreference.findFirst({
    where: {
      email: recipient.email
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
    to: recipient.email,
    subject: `${job.data.sender.firstName} requests access to a journey`,
    html,
    text
  })
}

export async function journeyRequestApproved(
  job: Job<JourneyRequestApproved>
): Promise<void> {
  const recipientUser = await prismaUsers.user.findUnique({
    where: { userId: job.data.userId }
  })

  if (recipientUser == null) throw new Error('User not found')
  const recipient = toEmailRecipient(recipientUser)
  if (recipient == null) throw new Error('User has no email')

  // check recipient preferences
  const preferences = await prisma.journeysEmailPreference.findFirst({
    where: {
      email: recipient.email
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
    to: recipient.email,
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

  const recipientUser = await prismaUsers.user.findUnique({
    where: { email: job.data.email }
  })

  if (recipientUser == null) {
    const url = `${env.JOURNEYS_ADMIN_URL}/`
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
    const recipient = toEmailRecipient(recipientUser)
    if (recipient == null) throw new Error('User has no email')

    const html = await render(
      JourneySharedEmail({
        sender: job.data.sender,
        journey: job.data.journey,
        inviteLink: job.data.url,
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
      to: job.data.email,
      subject: `${job.data.journey.title} has been shared with you on NextSteps`,
      html,
      text
    })
  }
}
