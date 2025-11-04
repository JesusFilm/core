import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'
import { GoogleSheetsSyncsFilter } from './inputs'

// List sync configurations filtered by journey or integration
builder.queryField('googleSheetsSyncs', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: [GoogleSheetsSync],
    nullable: false,
    args: { filter: t.arg({ type: GoogleSheetsSyncsFilter, required: true }) },
    resolve: async (query, _parent, { filter }, context) => {
      const userId = context.user?.id

      if (userId == null) {
        throw new GraphQLError('Unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      // Validate that exactly one filter is provided
      if (
        (filter.journeyId == null && filter.integrationId == null) ||
        (filter.journeyId != null && filter.integrationId != null)
      ) {
        throw new GraphQLError(
          'Exactly one of journeyId or integrationId must be provided',
          {
            extensions: { code: 'BAD_REQUEST' }
          }
        )
      }

      const where: { journeyId?: string; integrationId?: string } = {}

      if (filter.journeyId != null) {
        // Filter by journey - check export permission
        const journey = await prisma.journey.findUnique({
          where: { id: filter.journeyId },
          include: { team: { include: { userTeams: true } } }
        })
        if (journey == null) {
          throw new GraphQLError('Journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        if (
          !ability(Action.Export, subject('Journey', journey), context.user)
        ) {
          throw new GraphQLError('Forbidden', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        where.journeyId = filter.journeyId
      } else if (filter.integrationId != null) {
        // Filter by integration - check ownership or team manager role
        const integration = await prisma.integration.findUnique({
          where: { id: filter.integrationId },
          include: { team: { include: { userTeams: true } } }
        })

        if (integration == null) {
          throw new GraphQLError('Integration not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        const isIntegrationOwner = integration.userId === userId
        const isTeamManager = integration.team.userTeams.some(
          (userTeam) =>
            userTeam.userId === userId && userTeam.role === 'manager'
        )

        if (!isIntegrationOwner && !isTeamManager) {
          throw new GraphQLError('Forbidden', {
            extensions: { code: 'FORBIDDEN' }
          })
        }

        where.integrationId = filter.integrationId
      }

      return prisma.googleSheetsSync.findMany({
        ...query,
        where,
        orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
      })
    }
  })
)
