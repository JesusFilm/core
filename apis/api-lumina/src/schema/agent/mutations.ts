import { ZodError } from 'zod'

import { prisma } from '@core/prisma/lumina/client'

import { builder } from '../builder'
import { ForbiddenError } from '../error/ForbiddenError'
import { NotFoundError } from '../error/NotFoundError'

import { AgentCreateInput } from './inputs/createInput'
import { AgentUpdateInput } from './inputs/updateInput'

builder.mutationField('luminaAgentCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Agent',
    errors: {
      types: [ForbiddenError, ZodError]
    },
    args: {
      input: t.arg({ type: AgentCreateInput, required: true })
    },
    resolve: async (query, _parent, { input }, { user: { id: userId } }) => {
      const member = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: input.teamId, userId } }
      })

      if (!member)
        throw new ForbiddenError('Access denied', [
          {
            path: ['luminaAgentCreate', 'input', 'teamId'],
            value: input.teamId
          }
        ])

      return await prisma.agent.create({
        ...query,
        data: input
      })
    }
  })
)

builder.mutationField('luminaAgentUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Agent',
    errors: {
      types: [ForbiddenError, NotFoundError, ZodError]
    },
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: AgentUpdateInput, required: true })
    },
    resolve: async (
      query,
      _parent,
      { id, input },
      { user: { id: userId } }
    ) => {
      const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })

      if (!agent) {
        throw new NotFoundError('Agent not found', [
          { path: ['luminaUpdateAgent', 'id'], value: id }
        ])
      }

      const userMember = agent.team.members.find((m) => m.userId === userId)

      if (!userMember)
        throw new ForbiddenError('Access denied', [
          { path: ['luminaUpdateAgent', 'id'], value: id }
        ])

      return await prisma.agent.update({
        ...query,
        where: { id },
        data: {
          ...input,
          name: input.name ?? undefined,
          model: input.model ?? undefined,
          temperature: input.temperature ?? undefined
        }
      })
    }
  })
)

builder.mutationField('luminaAgentDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: 'Agent',
    errors: {
      types: [ForbiddenError, NotFoundError]
    },
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }, { user: { id: userId } }) => {
      const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
          team: {
            include: {
              members: true
            }
          }
        }
      })

      if (!agent) {
        throw new NotFoundError('Agent not found', [
          { path: ['luminaAgentDelete', 'id'], value: id }
        ])
      }

      const userMember = agent.team.members.find((m) => m.userId === userId)

      if (!userMember)
        throw new ForbiddenError('Access denied', [
          { path: ['luminaAgentDelete', 'id'], value: id }
        ])

      return await prisma.agent.delete({
        ...query,
        where: { id }
      })
    }
  })
)
