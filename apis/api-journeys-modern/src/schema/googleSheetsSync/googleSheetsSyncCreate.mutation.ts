import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'
import { CreateGoogleSheetsSyncInput } from './inputs'

export const GoogleSheetsSyncCreateMutation = builder.mutationField(
  'googleSheetsSyncCreate',
  (t) =>
    t
      .withAuth({ isAuthenticated: true })
      .prismaField({
        type: GoogleSheetsSync,
        nullable: false,
        args: {
          input: t.arg({ type: CreateGoogleSheetsSyncInput, required: true })
        },
        resolve: async (query, _parent, { input }, context) => {
          const journey = await prisma.journey.findUnique({
            where: { id: input.journeyId },
            include: {
              team: { include: { integrations: true, userTeams: true } }
            }
          })
          if (journey == null)
            throw new GraphQLError('Journey not found', {
              extensions: { code: 'NOT_FOUND' }
            })

          const googleIntegration = await prisma.integration.findFirst({
            where: {
              id: input.integrationId,
              teamId: journey.teamId,
              type: 'google'
            }
          })
          if (googleIntegration == null)
            throw new GraphQLError('Google integration not found for team', {
              extensions: { code: 'BAD_REQUEST' }
            })

          // Check permissions: must be team manager or integration owner
          const userId = context.user.id
          const isTeamManager =
            journey.team?.userTeams?.some(
              (userTeam) =>
                userTeam.userId === userId && userTeam.role === 'manager'
            ) ?? false
          const isIntegrationOwner = googleIntegration.userId === userId

          if (!(isIntegrationOwner || isTeamManager)) {
            throw new GraphQLError('Forbidden', {
              extensions: { code: 'FORBIDDEN' }
            })
          }

          // Must also have export ability on the journey
          if (
            !ability(Action.Export, subject('Journey', journey), context.user)
          ) {
            throw new GraphQLError('Forbidden', {
              extensions: { code: 'FORBIDDEN' }
            })
          }

          return await prisma.googleSheetsSync.create({
            ...query,
            data: {
              teamId: journey.teamId,
              journeyId: journey.id,
              integrationId: googleIntegration.id,
              spreadsheetId: input.spreadsheetId,
              sheetName: input.sheetName,
              folderId: input.folderId ?? null,
              email: googleIntegration.accountEmail ?? null,
              deletedAt: null
            }
          })
        }
      })
)
