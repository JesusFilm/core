import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'
import { ForbiddenError } from '../error/ForbiddenError'
import { NotFoundError } from '../error/NotFoundError'

import { TeamCreateInput } from './inputs/createInput'
import { TeamUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaTeamCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Team',
    errors: {
      types: [ZodError]
    },
    args: {
      input: t.arg({ required: true, type: TeamCreateInput })
    },
    resolve: async (query, _parent, { input }, { currentUser }) => {
      return await prisma.team.create({
        ...query,
        data: {
          ...input,
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
      types: [ForbiddenError, NotFoundError, ZodError]
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
