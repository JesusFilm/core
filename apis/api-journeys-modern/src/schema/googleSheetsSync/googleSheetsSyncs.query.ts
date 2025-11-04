import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'

// List sync configurations for a journey
builder.queryField('googleSheetsSyncs', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: [GoogleSheetsSync],
    nullable: false,
    args: { journeyId: t.arg.id({ required: true }) },
    resolve: async (query, _parent, { journeyId }, context) => {
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: { team: { include: { userTeams: true } } }
      })
      if (journey == null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!ability(Action.Export, subject('Journey', journey), context.user)) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return prisma.googleSheetsSync.findMany({
        ...query,
        where: { journeyId },
        orderBy: [{ deletedAt: 'asc' }, { createdAt: 'desc' }]
      })
    }
  })
)
