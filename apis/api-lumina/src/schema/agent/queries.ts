import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'
import { NotFoundError } from '../error/NotFoundError'

builder.queryField('luminaAgents', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Agent'],
    resolve: async (query, _parent, _args, { user }) => {
      return await prisma.agent.findMany({
        ...query,
        where: { team: { members: { some: { userId: user.id } } } }
      })
    }
  })
)

builder.queryField('luminaAgent', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Agent',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      const agent = await prisma.agent.findUnique({
        ...query,
        where: { id, team: { members: { some: { userId: user.id } } } }
      })
      if (!agent)
        throw new NotFoundError('Agent not found', [
          { path: ['luminaAgent', 'id'], value: id }
        ])
      return agent
    }
  })
)
