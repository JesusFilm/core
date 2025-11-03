import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaTeamPlan', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'TeamPlan',
    errors: { types: [NotFoundError] },
    args: {
      teamId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { teamId }, { user }) => {
      const plan = await prisma.teamPlan.findUnique({
        ...query,
        where: {
          teamId,
          team: {
            members: {
              some: {
                userId: user.id,
                role: { in: ['OWNER', 'MANAGER'] }
              }
            }
          }
        }
      })
      if (!plan)
        throw new NotFoundError('Team plan not found', [
          { path: ['luminaTeamPlan', 'teamId'], value: teamId }
        ])
      return plan
    }
  })
)
