import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaAgentApiKeys', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['ApiKey'],
    args: {
      agentId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { agentId }, { currentUser }) => {
      return await prisma.apiKey.findMany({
        ...query,
        where: {
          agentId,
          agent: { team: { members: { some: { userId: currentUser.id } } } }
        }
      })
    }
  })
)

builder.queryField('luminaAgentApiKey', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ApiKey',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { currentUser }) => {
      const apiKey = await prisma.apiKey.findUnique({
        ...query,
        where: {
          id,
          agent: { team: { members: { some: { userId: currentUser.id } } } }
        }
      })
      if (!apiKey)
        throw new NotFoundError('API key not found', [
          { path: ['luminaAgentApiKey', 'id'], value: id }
        ])
      return apiKey
    }
  })
)
