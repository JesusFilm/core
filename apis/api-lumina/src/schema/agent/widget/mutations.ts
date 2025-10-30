import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { ForbiddenError } from '../../error/ForbiddenError'
import { NotFoundError } from '../../error/NotFoundError'

import { AgentWidgetCreateInput } from './inputs/createInput'
import { AgentWidgetUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaAgentWidgetCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Widget',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      input: t.arg({ type: AgentWidgetCreateInput, required: true })
    },
    resolve: async (
      query,
      _parent,
      { input },
      { currentUser: { id: userId } }
    ) => {
      const agent = await prisma.agent.findUnique({
        where: { id: input.agentId },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })

      if (!agent)
        throw new NotFoundError('Agent not found', [
          {
            path: ['luminaAgentApiKeyCreate', 'input', 'agentId'],
            value: input.agentId
          }
        ])

      const member = agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          {
            path: ['luminaAgentApiKeyCreate', 'input', 'agentId'],
            value: input.agentId
          }
        ])

      return await prisma.widget.create({
        ...query,
        data: input
      })
    }
  })
)

builder.mutationField('luminaAgentWidgetUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Widget',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: AgentWidgetUpdateInput, required: true })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { currentUser: { id: userId } }
    ) => {
      // Get widget to verify access
      const widget = await prisma.widget.findUnique({
        where: { id },
        include: {
          agent: {
            include: {
              team: {
                include: {
                  members: true
                }
              }
            }
          }
        }
      })

      if (!widget) {
        throw new NotFoundError('Widget not found', [
          { path: ['luminaAgentWidgetUpdate', 'id'], value: id }
        ])
      }

      // Verify user has access to team
      const member = widget.agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentWidgetUpdate', 'id'], value: id }
        ])

      return await prisma.widget.update({
        ...query,
        where: { id },
        data: {
          ...input,
          name: input.name ?? undefined,
          enabled: input.enabled ?? undefined,
          allowedDomains: input.allowedDomains ?? undefined
        }
      })
    }
  })
)

builder.mutationField('luminaAgentWidgetDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Widget',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (
      query,
      _parent,
      { id },
      { currentUser: { id: userId } }
    ) => {
      // Get widget to verify access
      const widget = await prisma.widget.findUnique({
        where: { id },
        include: {
          agent: {
            include: {
              team: {
                include: {
                  members: true
                }
              }
            }
          }
        }
      })

      if (!widget) {
        throw new NotFoundError('Widget not found', [
          { path: ['luminaAgentWidgetDelete', 'id'], value: id }
        ])
      }

      // Verify user has access to team
      const member = widget.agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentWidgetDelete', 'id'], value: id }
        ])

      return await prisma.widget.delete({
        ...query,
        where: { id }
      })
    }
  })
)
