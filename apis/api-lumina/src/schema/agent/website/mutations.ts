import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { ForbiddenError } from '../../error/ForbiddenError'
import { NotFoundError } from '../../error/NotFoundError'

import { AgentWebsiteCreateInput } from './inputs/createInput'
import { AgentWebsiteUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaAgentWebsiteCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Website',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      input: t.arg({ type: AgentWebsiteCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user: { id: userId } }) => {
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
            path: ['luminaAgentWebsiteCreate', 'input', 'agentId'],
            value: input.agentId
          }
        ])

      const member = agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          {
            path: ['luminaAgentWebsiteCreate', 'input', 'agentId'],
            value: input.agentId
          }
        ])

      return await prisma.website.create({
        ...query,
        data: input
      })
    }
  })
)

builder.mutationField('luminaAgentWebsiteUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Website',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: AgentWebsiteUpdateInput, required: true })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { user: { id: userId } }
    ) => {
      // Get website to verify access
      const website = await prisma.website.findUnique({
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

      if (!website) {
        throw new NotFoundError('Website not found', [
          { path: ['luminaAgentWebsiteUpdate', 'id'], value: id }
        ])
      }

      // Verify user has access to team
      const member = website.agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentWebsiteUpdate', 'id'], value: id }
        ])

      return await prisma.website.update({
        ...query,
        where: { id },
        data: {
          ...input,
          name: input.name ?? undefined,
          enabled: input.enabled ?? undefined
        }
      })
    }
  })
)

builder.mutationField('luminaAgentWebsiteDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Website',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
      // Get website to verify access
      const website = await prisma.website.findUnique({
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

      if (!website) {
        throw new NotFoundError('Website not found', [
          { path: ['luminaAgentWebsiteDelete', 'id'], value: id }
        ])
      }

      // Verify user has access to team
      const member = website.agent.team.members.find((m) => m.userId === userId)

      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentWebsiteDelete', 'id'], value: id }
        ])

      return await prisma.website.delete({
        ...query,
        where: { id }
      })
    }
  })
)
