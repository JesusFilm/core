import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { ForbiddenError } from '../../error/ForbiddenError'
import { NotFoundError } from '../../error/NotFoundError'

import { TeamInvitationCreateInput } from './inputs/createInput'
import { generateToken, generateTokenHash } from './lib/generateToken'
import { sendTeamInvitationEmail } from './lib/sendTeamInvitationEmail'

builder.mutationField('luminaTeamInvitationCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamInvitation',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      input: t.arg({ required: true, type: TeamInvitationCreateInput })
    },
    resolve: async (query, _parent, { input }, { user: { id: userId } }) => {
      const userMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: input.teamId, userId }
        }
      })

      if (!userMember || !['OWNER', 'MANAGER'].includes(userMember.role))
        throw new ForbiddenError(
          'Only team owner or manager can create invitations',
          [{ path: ['input', 'teamId'], value: input.teamId }]
        )

      const { token, hash } = await generateToken()
      const invitation = await prisma.teamInvitation.create({
        ...query,
        data: {
          ...input,
          tokenHash: hash
        }
      })
      await sendTeamInvitationEmail(invitation.id, token)
      return invitation
    }
  })
)

builder.mutationField('luminaTeamInvitationAccept', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamMember',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      token: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, { token }, { user: { id: userId } }) => {
      const tokenHash = generateTokenHash(token)
      const invitation = await prisma.teamInvitation.findUnique({
        where: { tokenHash }
      })
      if (!invitation)
        throw new NotFoundError('Team invitation not found', [
          { path: ['token'], value: token }
        ])
      return await prisma.$transaction(async (tx) => {
        await tx.teamInvitation.delete({
          where: { id: invitation.id }
        })
        return await tx.teamMember.create({
          ...query,
          data: {
            teamId: invitation.teamId,
            userId,
            role: invitation.role
          }
        })
      })
    }
  })
)

builder.mutationField('luminaTeamInvitationResend', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamInvitation',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
      const invitation = await prisma.teamInvitation.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })
      if (!invitation)
        throw new NotFoundError('Team invitation not found', [
          { path: ['luminaTeamInvitationResend', 'id'], value: id }
        ])
      const userMember = invitation.team.members.find(
        (m) => m.userId === userId
      )
      if (!userMember || !['OWNER', 'MANAGER'].includes(userMember.role))
        throw new ForbiddenError(
          'Only team owner or manager can resend invitations',
          [{ path: ['luminaTeamInvitationResend', 'id'], value: id }]
        )
      const { token, hash } = await generateToken()
      const updatedInvitation = await prisma.teamInvitation.update({
        ...query,
        where: { id },
        data: { tokenHash: hash }
      })
      await sendTeamInvitationEmail(updatedInvitation.id, token)
      return updatedInvitation
    }
  })
)

builder.mutationField('luminaTeamInvitationDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamInvitation',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
      const invitation = await prisma.teamInvitation.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })
      if (!invitation)
        throw new NotFoundError('Team invitation not found', [
          { path: ['luminaTeamInvitationDelete', 'id'], value: id }
        ])

      const userMember = invitation.team.members.find(
        (m) => m.userId === userId
      )

      if (!userMember || !['OWNER', 'MANAGER'].includes(userMember.role))
        throw new ForbiddenError(
          'Only team owner or manager can delete invitations',
          [{ path: ['luminaTeamInvitationDelete', 'id'], value: id }]
        )

      return await prisma.teamInvitation.delete({
        ...query,
        where: { id }
      })
    }
  })
)
