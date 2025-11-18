import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { isInTeam } from '../authScopes'
import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'
import { GoogleSheetsSyncsFilter } from './inputs'

builder.queryField('googleSheetsSyncs', (t) =>
  t
    .withAuth((_parent, args) => ({
      $all: {
        isAuthenticated: true
      }
    }))
    .prismaField({
      type: [GoogleSheetsSync],
      nullable: false,
      args: {
        filter: t.arg({ type: GoogleSheetsSyncsFilter, required: true })
      },
      resolve: async (query, _parent, { filter }, context) => {
        // Validate that at least one filter is provided
        if (filter.journeyId == null && filter.integrationId == null) {
          throw new GraphQLError(
            'At least journeyId or integrationId must be provided',
            {
              extensions: { code: 'BAD_REQUEST' }
            }
          )
        }

        const where: { journeyId?: string; integrationId?: string } = {}

        // Filter by journey - check export permission
        if (filter.journeyId != null) {
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
        }

        // Filter by integration - check team membership
        if (filter.integrationId != null) {
          const integration = await prisma.integration.findUnique({
            where: { id: filter.integrationId },
            include: { team: { include: { userTeams: true } } }
          })

          if (integration == null) {
            throw new GraphQLError('Integration not found', {
              extensions: { code: 'NOT_FOUND' }
            })
          }

          if (!(await isInTeam({ context, teamId: integration.teamId }))) {
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
