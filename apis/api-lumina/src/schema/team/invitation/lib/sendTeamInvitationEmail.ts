import { render } from '@react-email/render'

import { prisma } from '@core/prisma/lumina/client'
import { sendEmail } from '@core/yoga/email'

import { TeamInvitationEmail } from '../../../../emails/TeamInvitationEmail'

export async function sendTeamInvitationEmail(
  invitationId: string,
  token: string
): Promise<void> {
  // TODO: send email with token
  const invitation = await prisma.teamInvitation.findUnique({
    where: { id: invitationId },
    include: {
      team: true
    }
  })

  if (!invitation) throw new Error('Invitation not found')

  const html = await render(
    TeamInvitationEmail({
      invitation,
      token
    })
  )
  const text = await render(
    TeamInvitationEmail({
      invitation,
      token
    }),
    { plainText: true }
  )

  await sendEmail({
    to: invitation.email,
    subject: 'Team Invitation',
    html,
    text
  })
}
