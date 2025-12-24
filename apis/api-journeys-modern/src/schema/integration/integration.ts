import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { IntegrationType as IntegrationTypeEnum } from './enums'

export const IntegrationRef = builder.prismaInterface('Integration', {
  resolveType: (integration) => {
    switch (integration.type) {
      case 'google':
        return 'IntegrationGoogle'
      case 'growthSpaces':
        return 'IntegrationGrowthSpaces'
      default:
        return null
    }
  },
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    type: t.expose('type', { type: IntegrationTypeEnum, nullable: false }),
    team: t.relation('team', { nullable: false })
  })
})

builder.queryField('integrations', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
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
