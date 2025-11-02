import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaTeamInvitations', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['TeamInvitation'],
    args: {
      teamId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { teamId }, { currentUser }) => {
      return await prisma.teamInvitation.findMany({
        ...query,
        where: {
          team: { id: teamId, members: { some: { userId: currentUser.id } } }
        }
      })
    }
  })
)

builder.queryField('luminaTeamInvitation', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamInvitation',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { currentUser }) => {
      const invitation = await prisma.teamInvitation.findUnique({
        ...query,
        where: { id, team: { members: { some: { userId: currentUser.id } } } }
      })
      if (!invitation)
        throw new NotFoundError('Team invitation not found', [
          { path: ['luminaTeamInvitation', 'id'], value: id }
        ])
      return invitation
    }
  })
)
