import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

export const IntegrationRef = builder.prismaInterface('Integration', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    type: t.expose('type', { type: IntegrationTypeEnum, nullable: false }),
    team: t.relation('team', { nullable: false })
  })
})

builder.queryField('integrations', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: [IntegrationRef],
    args: {
      teamId: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { teamId } = args
      const user = context.user

      // Check if user has access to this team
      const userTeam = await prisma.userTeam.findFirst({
        where: {
          userId: user.id,
          teamId
        }
      })

      if (!userTeam) {
        throw new GraphQLError(
          'user is not allowed to access team integrations',
          {
            extensions: { code: 'FORBIDDEN' }
          }
        )
      }

      return await prisma.integration.findMany({
        where: { teamId },
        orderBy: { type: 'asc' }
      })
    }
  })
)

builder.mutationField('integrationDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: IntegrationRef,
    args: {
      id: t.arg({ type: 'ID', required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Check if integration exists
      const integration = await prisma.integration.findUnique({
        where: { id },
        include: {
          team: {
            include: { userTeams: true }
          }
        }
      })

      if (!integration) {
        throw new GraphQLError('integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check if user has manage access
      const userTeam = integration.team.userTeams.find(
        (ut) => ut.userId === user.id
      )
      if (!userTeam || !['manager', 'member'].includes(userTeam.role)) {
        throw new GraphQLError('user is not allowed to delete integration', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.integration.delete({
        where: { id }
      })
    }
  })
)
