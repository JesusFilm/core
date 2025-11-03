import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaAgentWebsites', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Website'],
    args: {
      agentId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { agentId }, { user }) => {
      return await prisma.website.findMany({
        ...query,
        where: {
          agentId,
          agent: { team: { members: { some: { userId: user.id } } } }
        }
      })
    }
  })
)

builder.queryField('luminaAgentWebsite', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Website',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      const website = await prisma.website.findUnique({
        ...query,
        where: {
          id,
          agent: { team: { members: { some: { userId: user.id } } } }
        }
      })
      if (!website)
        throw new NotFoundError('Website not found', [
          { path: ['luminaAgentWebsite', 'id'], value: id }
        ])
      return website
    }
  })
)
