import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'
import { NotFoundError } from '../error/NotFoundError'

builder.queryField('luminaTeams', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Team'],
    resolve: async (query, _parent, _args, { user }) => {
      return await prisma.team.findMany({
        ...query,
        where: { members: { some: { userId: user.id } } }
      })
    }
  })
)

builder.queryField('luminaTeam', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Team',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      const team = await prisma.team.findUnique({
        ...query,
        where: { id, members: { some: { userId: user.id } } }
      })
      if (!team)
        throw new NotFoundError('Team not found', [
          { path: ['luminaTeam', 'id'], value: id }
        ])
      return team
    }
  })
)
