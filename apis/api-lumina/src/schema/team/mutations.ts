import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'
import { ForbiddenError } from '../error/ForbiddenError'
import { NotFoundError } from '../error/NotFoundError'

import { TeamUpdateInput } from './inputs/updateInput'
import {
  TeamInvitationCreateInput
} from './invitation/inputs/createInput'
import {
  generateToken,
  generateTokenHash
} from './invitation/lib/generateToken'
import { sendTeamInvitationEmail } from './invitation/lib/sendTeamInvitationEmail'
import { TeamMemberUpdateInput } from './member/inputs/updateInput'

builder.mutationField('luminaTeamCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Team',
    args: {
      name: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, { name }, { currentUser }) => {
      return await prisma.team.create({
        ...query,
        data: {
          name,
          members: { create: { userId: currentUser.id, role: 'OWNER' } }
        }
      })
    }
  })
)

builder.mutationField('luminaTeamUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Team',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ required: true, type: TeamUpdateInput })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { currentUser: { id: userId } }
    ) => {
      const member = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: id, userId }
        }
      })

      if (!member)
        throw new NotFoundError('Team not found', [{ path: ['id'], value: id }])

      if (!['OWNER', 'MANAGER'].includes(member.role))
        throw new ForbiddenError('Only team owner or manager can update team', [
          { path: ['luminaTeamUpdate', 'input', 'id'], value: id }
        ])

      return await prisma.team.update({
        ...query,
        where: { id },
        data: input
      })
    }
  })
)

builder.mutationField('luminaTeamMemberUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamMember',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ required: true, type: TeamMemberUpdateInput })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { currentUser: { id: userId } }
    ) => {
      const member = await prisma.teamMember.findUnique({
        where: {
          id
        },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })

      if (!member) {
        throw new NotFoundError('Team member not found', [
          { path: ['luminaTeamMemberUpdate', 'input', 'id'], value: id }
        ])
      }

      const currentUserMember = member.team.members.find(
        (m) => m.userId === userId
      )

      if (
        !currentUserMember ||
        ['OWNER', 'MANAGER'].includes(currentUserMember.role)
      )
        throw new ForbiddenError(
          'Only team owner or manager can update member roles',
          [{ path: ['luminaTeamMemberUpdate', 'input', 'id'], value: id }]
        )

      if (member.role === 'OWNER' || input.role === 'OWNER')
        throw new ForbiddenError(
          'Cannot change owner role. Use promoteOwner mutation instead.',
          [{ path: ['luminaTeamMemberUpdate', 'input', 'id'], value: id }]
        )

      return await prisma.teamMember.update({
        ...query,
        where: { id },
        data: input
      })
    }
  })
)

builder.mutationField('luminaTeamMemberPromoteOwner', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamMember',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { id },
      { currentUser: { id: userId } }
    ) => {
      const member = await prisma.teamMember.findUnique({
        where: {
          id
        },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })
      if (!member) {
        throw new NotFoundError('Team member not found', [
          { path: ['luminaTeamMemberPromoteOwner', 'id'], value: id }
        ])
      }

      const currentUserMember = member.team.members.find(
        (m) => m.userId === userId
      )

      if (!currentUserMember || ['OWNER'].includes(currentUserMember.role))
        throw new ForbiddenError('Only team owner can promote owner', [
          { path: ['luminaTeamMemberPromoteOwner', 'id'], value: id }
        ])

      return await prisma.$transaction(async (tx) => {
        await tx.teamMember.update({
          where: { id: currentUserMember.id },
          data: { role: 'MANAGER' }
        })
        return await tx.teamMember.update({
          ...query,
          where: { id },
          data: { role: 'OWNER' }
        })
      })
    }
  })
)

builder.mutationField('luminaTeamMemberDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamMember',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { id },
      { currentUser: { id: userId } }
    ) => {
      const member = await prisma.teamMember.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })
      if (!member)
        throw new NotFoundError('Team member not found', [
          { path: ['luminaTeamMemberDelete', 'id'], value: id }
        ])

      if (member.userId === userId)
        throw new ForbiddenError('Cannot delete current user', [
          { path: ['luminaTeamMemberDelete', 'id'], value: id }
        ])

      return await prisma.teamMember.delete({
        ...query,
        where: { id }
      })
    }
  })
)

builder.mutationField('luminaTeamInvitationCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamInvitation',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      input: t.arg({ required: true, type: TeamInvitationCreateInput })
    },
    resolve: async (
      query,
      _parent,
      { input },
      { currentUser: { id: userId } }
    ) => {
      const currentUserMember = await prisma.teamMember.findUnique({
        where: {
          teamId_userId: { teamId: input.teamId, userId }
        }
      })

      if (
        !currentUserMember ||
        !['OWNER', 'MANAGER'].includes(currentUserMember.role)
      )
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
    resolve: async (
      query,
      _parent,
      { token },
      { currentUser: { id: userId } }
    ) => {
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
    resolve: async (
      query,
      _parent,
      { id },
      { currentUser: { id: userId } }
    ) => {
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
      const currentUserMember = invitation.team.members.find(
        (m) => m.userId === userId
      )
      if (
        !currentUserMember ||
        ['OWNER', 'MANAGER'].includes(currentUserMember.role)
      )
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
    resolve: async (
      query,
      _parent,
      { id },
      { currentUser: { id: userId } }
    ) => {
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

      const currentUserMember = invitation.team.members.find(
        (m) => m.userId === userId
      )

      if (
        !currentUserMember ||
        ['OWNER', 'MANAGER'].includes(currentUserMember.role)
      )
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
