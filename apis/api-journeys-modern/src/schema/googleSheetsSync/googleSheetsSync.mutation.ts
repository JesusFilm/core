import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

const GoogleSheetsSyncRef = builder.prismaObject('GoogleSheetsSync', {
  fields: (t) => ({
    id: t.exposeID('id'),
    teamId: t.exposeString('teamId'),
    journeyId: t.exposeString('journeyId'),
    spreadsheetId: t.exposeString('spreadsheetId'),
    sheetName: t.exposeString('sheetName'),
    folderId: t.exposeString('folderId', { nullable: true }),
    appendMode: t.exposeBoolean('appendMode')
  })
})

const CreateGoogleSheetsSyncInput = builder.inputType(
  'CreateGoogleSheetsSyncInput',
  {
    fields: (t) => ({
      journeyId: t.string({ required: true }),
      integrationId: t.string({ required: true }),
      spreadsheetId: t.string({ required: true }),
      sheetName: t.string({ required: true }),
      folderId: t.string(),
      appendMode: t.boolean()
    })
  }
)

builder.mutationField('createGoogleSheetsSync', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: GoogleSheetsSyncRef,
    nullable: false,
    args: {
      input: t.arg({ type: CreateGoogleSheetsSyncInput, required: true })
    },
    resolve: async (query, _parent, { input }, context) => {
      const userId = context.user?.id
      if (userId == null)
        throw new GraphQLError('unauthenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })

      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId },
        include: { team: { include: { integrations: true, userTeams: true } } }
      })
      if (journey == null)
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      // Only the specified integration's originating user may create a sync
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
      if (googleIntegration.userId !== userId) {
        throw new GraphQLError('Only the integration owner can create a sync', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Must also have export ability on the journey
      if (!ability(Action.Export, subject('Journey', journey), context.user)) {
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
          appendMode: input.appendMode ?? true
        }
      })
    }
  })
)

builder.mutationField('deleteGoogleSheetsSync', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: GoogleSheetsSyncRef,
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
