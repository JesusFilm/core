import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'

builder.mutationField('googleSheetsSyncDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: GoogleSheetsSync,
    nullable: false,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (query, _parent, { id }, context) => {
      const userId = context.user.id

      const sync = await prisma.googleSheetsSync.findUnique({
        where: { id },
        include: {
          team: { include: { userTeams: true } },
          integration: true,
          journey: true
        }
      })
      if (sync == null)
        throw new GraphQLError('Sync not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const isTeamManager =
        sync.team?.userTeams?.some(
          (userTeam) => userTeam.userId === userId && userTeam.role === 'manager'
        ) ?? false
      const isIntegrationOwner =
        sync.integration != null && sync.integration.userId === userId

      if (!(isIntegrationOwner || isTeamManager)) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.googleSheetsSync.update({
        ...query,
        where: { id },
        data: {
          deletedAt: new Date()
        }
      })
    }
  })
)
