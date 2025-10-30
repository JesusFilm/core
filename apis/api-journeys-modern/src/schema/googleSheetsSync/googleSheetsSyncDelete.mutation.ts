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
      const userId = context.user?.id
      if (userId == null)
        throw new GraphQLError('unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })

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

      const isTeamManagerOrOwner = sync.team.userTeams.some(
        (ut) => ut.userId === userId && ut.role === 'manager'
      )
      const isIntegrationOwner = sync.integration.userId === userId

      if (!isIntegrationOwner && !isTeamManagerOrOwner) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.googleSheetsSync.delete({ ...query, where: { id } })
    }
  })
)
