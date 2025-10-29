import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'

builder.queryField('luminaTeams', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Team'],
    resolve: async (query, _parent, _args, { currentUser }) => {
      return await prisma.team.findMany({
        ...query,
        where: { members: { some: { userId: currentUser.id } } }
      })
    }
  })
)

builder.queryField('luminaTeam', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Team',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { currentUser }) => {
      return await prisma.team.findUnique({
        ...query,
        where: { id, members: { some: { userId: currentUser.id } } }
      })
    }
  })
)

builder.queryField('luminaTeamMembers', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['TeamMember'],
    args: {
      teamId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { teamId }, { currentUser }) => {
      return await prisma.teamMember.findMany({
        ...query,
        where: {
          team: { id: teamId, members: { some: { userId: currentUser.id } } }
        }
      })
    }
  })
)
