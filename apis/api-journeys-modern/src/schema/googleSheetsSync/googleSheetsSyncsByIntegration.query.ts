import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'

builder.queryField('googleSheetsSyncsByIntegration', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: [GoogleSheetsSync],
    nullable: false,
    args: { integrationId: t.arg.id({ required: true }) },
    resolve: async (query, _parent, { integrationId }, context) => {
      const userId = context.user?.id

      if (userId == null) {
        throw new GraphQLError('Unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      const integration = await prisma.integration.findUnique({
        where: { id: integrationId },
        include: { team: { include: { userTeams: true } } }
      })

      if (integration == null) {
        throw new GraphQLError('Integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const isIntegrationOwner = integration.userId === userId
      const isTeamManager = integration.team.userTeams.some(
        (userTeam) => userTeam.userId === userId && userTeam.role === 'manager'
      )

      if (!isIntegrationOwner && !isTeamManager) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return prisma.googleSheetsSync.findMany({
        ...query,
        where: { integrationId },
        orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
      })
    }
  })
)
