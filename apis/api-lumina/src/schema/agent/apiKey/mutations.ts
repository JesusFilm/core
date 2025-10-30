import { randomBytes } from 'crypto'

import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../../builder'
import { ForbiddenError, NotFoundError } from '../../error'

import { AgentApiKeyCreateInput } from './inputs/createInput'
import { AgentApiKeyUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaAgentApiKeyCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ApiKey',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      input: t.arg({ type: AgentApiKeyCreateInput, required: true })
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

      return await prisma.apiKey.create({
        ...query,
        data: {
          ...input,
          key: randomBytes(32).toString('hex')
        }
      })
    }
  })
)

builder.mutationField('luminaAgentApiKeyUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ApiKey',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: AgentApiKeyUpdateInput, required: true })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { currentUser: { id: userId } }
    ) => {
      const apiKey = await prisma.apiKey.findUnique({
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

      if (!apiKey)
        throw new NotFoundError('API key not found', [
          { path: ['luminaAgentApiKeyUpdate', 'id'], value: id }
        ])

      const member = apiKey.agent.team.members.find((m) => m.userId === userId)
      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentApiKeyUpdate', 'id'], value: id }
        ])

      return await prisma.apiKey.update({
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

builder.mutationField('luminaAgentApiKeyDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'ApiKey',
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
      const apiKey = await prisma.apiKey.findUnique({
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

      if (!apiKey)
        throw new NotFoundError('API key not found', [
          { path: ['luminaAgentApiKeyDelete', 'id'], value: id }
        ])

      const member = apiKey.agent.team.members.find((m) => m.userId === userId)
      if (!member)
        throw new ForbiddenError('User is not a member of the team', [
          { path: ['luminaAgentApiKeyDelete', 'id'], value: id }
        ])

      return await prisma.apiKey.delete({
        ...query,
        where: { id }
      })
    }
  })
)
