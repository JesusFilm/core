import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaTeamMembers', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['TeamMember'],
    args: {
      teamId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { teamId }, { user }) => {
      return await prisma.teamMember.findMany({
        ...query,
        where: {
          team: { id: teamId, members: { some: { userId: user.id } } }
        }
      })
    }
  })
)

builder.queryField('luminaTeamMember', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamMember',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      const member = await prisma.teamMember.findUnique({
        ...query,
        where: { id, team: { members: { some: { userId: user.id } } } }
      })
      if (!member)
        throw new NotFoundError('Team member not found', [
          { path: ['luminaTeamMember', 'id'], value: id }
        ])
      return member
    }
  })
)
