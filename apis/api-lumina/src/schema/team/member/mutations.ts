import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { ForbiddenError } from '../../error/ForbiddenError'
import { NotFoundError } from '../../error/NotFoundError'

import { TeamMemberUpdateInput } from './inputs/updateInput'

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
      { user: { id: userId } }
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

      const userMember = member.team.members.find((m) => m.userId === userId)

      if (!userMember || ['OWNER', 'MANAGER'].includes(userMember.role))
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
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
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

      const userMember = member.team.members.find((m) => m.userId === userId)

      if (!userMember || ['OWNER'].includes(userMember.role))
        throw new ForbiddenError('Only team owner can promote owner', [
          { path: ['luminaTeamMemberPromoteOwner', 'id'], value: id }
        ])

      return await prisma.$transaction(async (tx) => {
        await tx.teamMember.update({
          where: { id: userMember.id },
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
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
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
