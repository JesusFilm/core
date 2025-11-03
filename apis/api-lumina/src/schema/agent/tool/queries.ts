import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaAgentTools', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['AgentTool'],
    args: {
      agentId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { agentId }, { user }) => {
      return await prisma.agentTool.findMany({
        ...query,
        where: {
          agentId,
          agent: { team: { members: { some: { userId: user.id } } } }
        }
      })
    }
  })
)

builder.queryField('luminaAgentTool', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'AgentTool',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user }) => {
      const tool = await prisma.agentTool.findUnique({
        ...query,
        where: {
          id,
          agent: { team: { members: { some: { userId: user.id } } } }
        }
      })
      if (!tool)
        throw new NotFoundError('Agent tool not found', [
          { path: ['luminaAgentTool', 'id'], value: id }
        ])
      return tool
    }
  })
)
