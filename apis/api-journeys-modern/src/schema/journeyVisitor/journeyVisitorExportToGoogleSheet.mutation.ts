import { format } from 'date-fns'
import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { getIntegrationGoogleAccessToken } from '../../lib/google/googleAuth'
import { createSpreadsheet, ensureSheet } from '../../lib/google/sheets'
import { builder } from '../builder'
import { JourneyEventsFilter } from '../event/journey/inputs'

import { JourneyVisitorExportSelect } from './inputs'

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
export function __setGoogleSheetsSyncQueueForExportTests(mockQueue: any): void {
  googleSheetsSyncQueue = mockQueue
}

const ONE_HOUR = 60 * 60 // in seconds

const ExportDestinationInput = builder.inputType(
  'JourneyVisitorGoogleSheetDestinationInput',
  {
    fields: (t) => ({
      mode: t.field({
        type: builder.enumType('GoogleSheetExportMode', {
          values: ['create', 'existing'] as const
        }),
        required: true
      }),
      spreadsheetTitle: t.string({
        description:
          'Required when mode is "create". The title for the new spreadsheet.'
      }),
      folderId: t.string({
        description:
          'Optional when mode is "create". The Drive folder ID to create the spreadsheet in. If omitted, it will be created in My Drive.'
      }),
      spreadsheetId: t.string({
        description:
          'Required when mode is "existing". The ID of the existing spreadsheet to export to.'
      }),
      sheetName: t.string({
        description:
          'Required when mode is "existing". The name of the sheet within the existing spreadsheet.'
      })
    })
  }
)

const ExportResultRef = builder.objectRef<{
  spreadsheetId: string
  spreadsheetUrl: string
  sheetName: string
}>('JourneyVisitorGoogleSheetExportResult')
builder.objectType(ExportResultRef, {
  fields: (t) => ({
    spreadsheetId: t.exposeID('spreadsheetId', { nullable: false }),
    spreadsheetUrl: t.exposeString('spreadsheetUrl', { nullable: false }),
    sheetName: t.exposeString('sheetName', { nullable: false })
  })
})

/**
 * Mutation to export journey visitors to a Google Sheet.
 *
 * This mutation:
 * 1. Creates or ensures the spreadsheet/sheet exists
 * 2. Creates the GoogleSheetsSync record
 * 3. Enqueues a 'create' job to the worker for async data writing
 *
 * The actual data writing happens asynchronously in the worker to prevent
 * locking issues with concurrent event sync operations.
 */
builder.mutationField('journeyVisitorExportToGoogleSheet', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ExportResultRef,
    nullable: false,
    args: {
      journeyId: t.arg.id({ required: true }),
      filter: t.arg({ type: JourneyEventsFilter, required: false }),
      select: t.arg({ type: JourneyVisitorExportSelect, required: false }),
      destination: t.arg({ type: ExportDestinationInput, required: true }),
      integrationId: t.arg.id({ required: true }),
      timezone: t.arg.string({
        required: false,
        description:
          'IANA timezone identifier (e.g., "Pacific/Auckland"). Defaults to UTC if not provided.'
      })
    },
    resolve: async (
      _parent,
      // filter and select are accepted for backward compatibility but not used
      // Data processing now happens asynchronously in the worker
      {
        journeyId,
        filter: _filter,
        select: _select,
        destination,
        integrationId,
        timezone
      },
      context
    ) => {
      // Use user's timezone or default to UTC
      const userTimezone = timezone ?? 'UTC'

      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          team: { include: { userTeams: true } },
          userJourneys: true
        }
      })

      if (journey == null) {
        throw new GraphQLError('Journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      if (!ability(Action.Export, subject('Journey', journey), context.user)) {
        throw new GraphQLError('User is not allowed to export visitors', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Validate integration
      const accessToken = (await getIntegrationGoogleAccessToken(integrationId))
        .accessToken

      const integrationRecord = await prisma.integration.findUnique({
        where: { id: integrationId },
        select: { id: true, accountEmail: true }
      })

      if (integrationRecord == null) {
        throw new GraphQLError('Integration not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      const integrationIdUsed = integrationRecord.id
      const integrationEmail = integrationRecord.accountEmail ?? null

      // Validate required fields based on mode
      if (destination.mode === 'create') {
        if (
          destination.spreadsheetTitle == null ||
          destination.spreadsheetTitle.trim() === ''
        ) {
          throw new GraphQLError(
            'spreadsheetTitle is required when mode is "create"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
      } else if (destination.mode === 'existing') {
        if (
          destination.spreadsheetId == null ||
          destination.spreadsheetId.trim() === ''
        ) {
          throw new GraphQLError(
            'spreadsheetId is required when mode is "existing"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
        if (
          destination.sheetName == null ||
          destination.sheetName.trim() === ''
        ) {
          throw new GraphQLError(
            'sheetName is required when mode is "existing"',
            { extensions: { code: 'BAD_USER_INPUT' } }
          )
        }
      }

      let spreadsheetId: string
      let spreadsheetUrl: string
      const sheetName =
        destination.sheetName ??
        `${format(new Date(), 'yyyy-MM-dd')} ${journey.slug ?? ''}`.trim()

      // Create spreadsheet or ensure existing sheet exists
      if (destination.mode === 'create') {
        const res = await createSpreadsheet({
          accessToken,
          title: destination.spreadsheetTitle!,
          folderId: destination.folderId ?? undefined,
          initialSheetTitle: sheetName
        })
        spreadsheetId = res.spreadsheetId
        spreadsheetUrl = res.spreadsheetUrl
      } else {
        spreadsheetId = destination.spreadsheetId!
        spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}`
        // Ensure the sheet tab exists
        await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })
      }

      // Check for existing sync
      const existingSync = await prisma.googleSheetsSync.findFirst({
        where: {
          teamId: journey.teamId,
          journeyId,
          spreadsheetId,
          sheetName
        }
      })

      if (existingSync != null) {
        throw new GraphQLError(
          'A sync already exists for this journey, spreadsheet, and sheet combination',
          { extensions: { code: 'CONFLICT' } }
        )
      }

      // Create the sync record first
      const syncData = {
        teamId: journey.teamId,
        journeyId,
        integrationId: integrationIdUsed,
        spreadsheetId,
        sheetName,
        folderId:
          destination.mode === 'create' ? (destination.folderId ?? null) : null,
        email: integrationEmail,
        timezone: userTimezone,
        deletedAt: null
      }

      const sync = await prisma.googleSheetsSync.create({ data: syncData })

      // Enqueue the 'create' job to write data asynchronously
      // This prevents locking issues with concurrent event sync operations
      if (googleSheetsSyncQueue != null) {
        await googleSheetsSyncQueue.add(
          'google-sheets-sync-create',
          {
            type: 'create',
            journeyId,
            teamId: journey.teamId,
            syncId: sync.id,
            spreadsheetId,
            sheetName,
            timezone: userTimezone,
            integrationId: integrationIdUsed
          },
          {
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

      return { spreadsheetId, spreadsheetUrl, sheetName }
    }
  })
)
