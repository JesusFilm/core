import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { NotFoundError } from '../../error/NotFoundError'

builder.queryField('luminaAgentWidgets', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: ['Widget'],
    args: {
      agentId: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { agentId }, { currentUser }) => {
      return await prisma.widget.findMany({
        ...query,
        where: {
          agentId,
          agent: { team: { members: { some: { userId: currentUser.id } } } }
        }
      })
    }
  })
)

builder.queryField('luminaAgentWidget', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Widget',
    errors: {
      types: [NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { currentUser }) => {
      const widget = await prisma.widget.findUnique({
        ...query,
        where: {
          id,
          agent: { team: { members: { some: { userId: currentUser.id } } } }
        }
      })
      if (!widget)
        throw new NotFoundError('Widget not found', [
          { path: ['luminaAgentWidget', 'id'], value: id }
        ])
      return widget
    }
  })
)
