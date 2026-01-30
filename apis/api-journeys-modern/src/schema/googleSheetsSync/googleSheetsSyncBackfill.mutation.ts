import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { GoogleSheetsSync } from './googleSheetsSync'

// Queue for Google Sheets sync - lazily loaded to avoid Redis in tests
let googleSheetsSyncQueue: any
try {
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    googleSheetsSyncQueue =
      require('../../workers/googleSheetsSync/queue').queue
  }
} catch {
  googleSheetsSyncQueue = null
}

// Test helper to inject a mock queue
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setGoogleSheetsSyncQueueForBackfillTests(
  mockQueue: any
): void {
  googleSheetsSyncQueue = mockQueue
}

const ONE_HOUR = 60 * 60 // in seconds

/**
 * Mutation to trigger a backfill of a Google Sheets sync.
 * This clears existing data in the sheet and re-exports all events from scratch.
 * The operation runs inside the worker to prevent locking issues.
 */
builder.mutationField('googleSheetsSyncBackfill', (t) =>
  t.withAuth({ isAuthenticated: true }).prismaField({
    type: GoogleSheetsSync,
    nullable: false,
    args: { id: t.arg.id({ required: true }) },
    description:
      'Triggers a backfill of the Google Sheets sync. Clears existing data and re-exports all events.',
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

      if (sync == null) {
        throw new GraphQLError('Sync not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (sync.deletedAt != null) {
        throw new GraphQLError('Sync has been deleted', {
          extensions: { code: 'BAD_REQUEST' }
        })
      }

      // Check permissions: must be team manager or integration owner
      const isTeamManager =
        sync.team?.userTeams?.some(
          (userTeam) =>
            userTeam.userId === userId && userTeam.role === 'manager'
        ) ?? false
      const isIntegrationOwner =
        sync.integration != null && sync.integration.userId === userId

      if (!(isIntegrationOwner || isTeamManager)) {
        throw new GraphQLError('Forbidden', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Validate required fields for backfill
      if (sync.integrationId == null) {
        throw new GraphQLError(
          'Integration not found for this sync. Cannot backfill.',
          { extensions: { code: 'BAD_REQUEST' } }
        )
      }

      if (sync.sheetName == null) {
        throw new GraphQLError(
          'Sheet name not set for this sync. Cannot backfill.',
          { extensions: { code: 'BAD_REQUEST' } }
        )
      }

      // Enqueue the backfill job
      if (googleSheetsSyncQueue != null) {
        await googleSheetsSyncQueue.add(
          'google-sheets-sync-backfill',
          {
            type: 'backfill',
            journeyId: sync.journeyId,
            teamId: sync.teamId,
            syncId: sync.id,
            spreadsheetId: sync.spreadsheetId,
            sheetName: sync.sheetName,
            timezone: sync.timezone ?? 'UTC',
            integrationId: sync.integrationId
          },
          {
            jobId: `backfill-${sync.id}`,
            attempts: 3,
            backoff: {
              type: 'exponential',
              delay: 1000
            },
            removeOnComplete: true,
            removeOnFail: { age: ONE_HOUR }
          }
        )
      }

      // Return the sync record (backfill happens asynchronously in the worker)
      return await prisma.googleSheetsSync.findUniqueOrThrow({
        ...query,
        where: { id }
      })
    }
  })
)
