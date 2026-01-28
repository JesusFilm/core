import { format } from 'date-fns'
import { GraphQLError } from 'graphql'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { getIntegrationGoogleAccessToken } from '../../lib/google/googleAuth'
import {
  createSpreadsheet,
  ensureSheet,
  readValues,
  writeValues
} from '../../lib/google/sheets'
import { builder } from '../builder'
import { JourneyEventsFilter } from '../event/journey/inputs'
import { logger } from '../logger'

import { computeConnectedBlockIds } from './export/connectivity'
import { sanitizeGoogleSheetsCell } from './export/csv'
import {
  formatDateYmdInTimeZone,
  parseDateInTimeZoneToUtc
} from './export/date'
import { mergeGoogleSheetsHeader } from './export/googleSheetsHeader'
import {
  buildNormalizedBlockHeadersFromEvents,
  getDefaultBaseColumnLabelResolver,
  getDefaultBaseColumns
} from './export/googleSheetsSyncShared'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows,
  buildJourneyExportColumns,
  getCardHeading as getCardHeadingHelper
} from './export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from './export/order'
import { JourneyVisitorExportSelect } from './inputs'

const journeyBlockSelect = {
  id: true,
  typename: true,
  parentBlockId: true,
  parentOrder: true,
  nextBlockId: true,
  action: true,
  content: true,
  x: true,
  y: true,
  deletedAt: true,
  exportOrder: true
} as const

interface JourneyVisitorExportRow {
  visitorId: string
  date: string
  [key: string]: string
}

async function* getJourneyVisitors(
  journeyId: string,
  eventWhere: Prisma.EventWhereInput,
  timezone: string,
  batchSize: number = 1000
): AsyncGenerator<JourneyVisitorExportRow> {
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const journeyVisitors = await prisma.journeyVisitor.findMany({
      where: {
        journeyId,
        events: {
          some: eventWhere
        }
      },
      take: batchSize,
      skip: offset,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        createdAt: true,
        visitor: {
          select: {
            id: true
          }
        },
        events: {
          where: eventWhere,
          select: {
            blockId: true,
            label: true,
            value: true,
            typename: true
          },
          orderBy: {
            createdAt: 'asc'
          }
        }
      }
    })

    if (journeyVisitors.length === 0) {
      hasMore = false
      break
    }

    for (const journeyVisitor of journeyVisitors) {
      // Format date in user's timezone to match frontend display
      const date = formatDateYmdInTimeZone(journeyVisitor.createdAt, timezone)
      const row: JourneyVisitorExportRow = {
        visitorId: journeyVisitor.visitor.id,
        date
      }
      // Group events by blockId-label key and collect values deterministically
      const eventValuesByKey = new Map<string, string[]>()
      journeyVisitor.events.forEach((event) => {
        if (event.blockId) {
          // Normalize label to match header key format
          const normalizedLabel = (event.label ?? '')
            .replace(/\s+/g, ' ')
            .trim()
          const key = `${event.blockId}-${normalizedLabel}`
          const eventValue = event.value ?? ''
          if (!eventValuesByKey.has(key)) {
            eventValuesByKey.set(key, [])
          }
          eventValuesByKey.get(key)!.push(eventValue)
        }
      })
      // Join values with a fixed separator and sanitize for Google Sheets
      eventValuesByKey.forEach((values, key) => {
        const sanitizedValues = values.map((value) =>
          sanitizeGoogleSheetsCell(value)
        )
        row[key] = sanitizedValues.join('; ')
      })
      yield row
    }

    offset += batchSize
    hasMore = journeyVisitors.length === batchSize
  }
}

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
      { journeyId, filter, select, destination, integrationId, timezone },
      context
    ) => {
      // Use user's timezone or default to UTC
      const userTimezone = timezone ?? 'UTC'
      const journey = await prisma.journey.findUnique({
        where: { id: journeyId },
        include: {
          team: { include: { userTeams: true } },
          userJourneys: true,
          blocks: {
            select: journeyBlockSelect,
            orderBy: { updatedAt: 'asc' }
          }
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

      // Build a map of blocks (non-deleted only) and compute renderer-aligned order
      const journeyBlocks = journey.blocks.filter((b) => b.deletedAt == null)
      const idToBlock = new Map(journeyBlocks.map((b) => [b.id, b]))

      const simpleBlocks: SimpleBlock[] = journeyBlocks.map((b) => ({
        id: b.id,
        typename: b.typename,
        parentBlockId: b.parentBlockId ?? null,
        parentOrder: b.parentOrder ?? null
      }))
      const treeRoots = buildRenderTree(simpleBlocks)
      const orderIndex = computeOrderIndex(treeRoots)

      // Apply connectivity filter unless explicitly requested to include unconnected
      const includeOld = filter?.includeUnconnectedCards === true
      const connectedBlockIds = computeConnectedBlockIds({ journeyBlocks })
      const allowedBlockIds =
        includeOld === true
          ? new Set(simpleBlocks.map((b) => b.id))
          : connectedBlockIds

      const eventWhere: Prisma.EventWhereInput = {
        journeyId: journeyId,
        blockId:
          includeOld === true
            ? { not: null }
            : { in: Array.from(allowedBlockIds) }
      }

      // Filter by typenames - if provided use those, otherwise default to submission events only
      if (filter?.typenames && filter.typenames.length > 0) {
        eventWhere.typename = { in: filter.typenames }
      } else {
        // Default: only include submission events (exclude view/navigation events)
        eventWhere.typename = {
          in: [
            'RadioQuestionSubmissionEvent',
            'MultiselectSubmissionEvent',
            'TextResponseSubmissionEvent',
            'SignUpSubmissionEvent'
          ]
        }
      }
      if (filter?.periodRangeStart || filter?.periodRangeEnd) {
        eventWhere.createdAt = {}
        if (filter.periodRangeStart) {
          eventWhere.createdAt.gte = parseDateInTimeZoneToUtc(
            filter.periodRangeStart,
            userTimezone
          )
        }
        if (filter.periodRangeEnd) {
          eventWhere.createdAt.lte = parseDateInTimeZoneToUtc(
            filter.periodRangeEnd,
            userTimezone
          )
        }
      }

      // Get unique blockId_label combinations for headers using Prisma
      const blockHeadersResult = await prisma.event.findMany({
        where: eventWhere,
        select: {
          blockId: true,
          label: true
        },
        distinct: ['blockId', 'label'],
        // Order by createdAt to ensure consistent "first" label per blockId
        orderBy: { createdAt: 'asc' }
      })

      const normalizedBlockHeaders =
        buildNormalizedBlockHeadersFromEvents(blockHeadersResult)

      const getCardHeading = (blockId: string | null | undefined) =>
        getCardHeadingHelper(idToBlock as any, journeyBlocks as any, blockId)

      const baseColumns: JourneyExportColumn[] = getDefaultBaseColumns()
      const columns = buildJourneyExportColumns({
        baseColumns,
        blockHeaders: normalizedBlockHeaders,
        journeyBlocks,
        orderIndex
      })

      const resolveBaseColumnLabel: BaseColumnLabelResolver =
        getDefaultBaseColumnLabelResolver()

      const { headerRow } = buildHeaderRows({
        columns,
        userTimezone,
        getCardHeading,
        baseColumnLabelResolver: resolveBaseColumnLabel
      })

      // Compute the desired header keys for this export
      const desiredHeader = columns.map((c) => c.key)
      let finalHeaderRow = headerRow

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
      }

      // Check for existing sync immediately after spreadsheetId and sheetName are resolved,
      // before any Google API calls (ensureSheet, readValues, writeValues)
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

      // Read existing header (for existing sheets) and merge to preserve/extend columns
      let finalHeader = desiredHeader
      if (destination.mode === 'existing') {
        await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })
        // Read first row (header row)
        const headerRes = await readValues({
          accessToken,
          spreadsheetId,
          range: `${sheetName}!A1:ZZ1`
        })
        const existingHeaderRow: string[] = (headerRes[0] ?? []).map(
          (v) => v ?? ''
        )
        const mergedHeader = mergeGoogleSheetsHeader({
          baseKeys: ['visitorId', 'date'],
          columns,
          desiredHeaderKeys: desiredHeader,
          existingHeaderRowLabels: existingHeaderRow,
          userTimezone,
          getCardHeading,
          baseColumnLabelResolver: resolveBaseColumnLabel
        })
        finalHeader = mergedHeader.finalHeaderKeys
        finalHeaderRow = mergedHeader.finalHeaderRowLabels
      }

      // Build data rows aligned to finalHeader with sanitization for Google Sheets
      const rowWidth = finalHeaderRow.length
      const sanitizedHeaderRow = finalHeaderRow.map((cell) =>
        sanitizeGoogleSheetsCell(cell)
      )

      const values: (string | null)[][] = [sanitizedHeaderRow]
      for await (const row of getJourneyVisitors(
        journeyId,
        eventWhere,
        userTimezone
      )) {
        // Build a lookup map from the row using the same keys as getJourneyVisitors
        // The row already contains keys like 'visitorId', 'date', and '${blockId}-${label}'
        const rowLookup = new Map<string, string>()
        for (const [key, value] of Object.entries(row)) {
          rowLookup.set(key, sanitizeGoogleSheetsCell(value))
        }

        // Iterate over finalHeader to produce aligned values matching the header row order
        // This ensures each column gets its corresponding value (or empty string if missing)
        const aligned = finalHeader.map((key) => {
          return rowLookup.get(key) ?? ''
        })
        const padded =
          aligned.length >= rowWidth
            ? aligned
            : [
                ...aligned,
                ...Array.from({ length: rowWidth - aligned.length }).map(() => '')
              ]
        values.push(padded)
      }

      await writeValues({
        accessToken,
        spreadsheetId,
        sheetTitle: sheetName,
        values,
        append: false
      })

      // Record Google Sheets sync configuration for this journey
      const syncData = {
        teamId: journey.teamId,
        journeyId,
        integrationId: integrationIdUsed,
        spreadsheetId,
        sheetName,
        folderId:
          destination.mode === 'create' ? (destination.folderId ?? null) : null,
        email: integrationEmail,
        timezone: userTimezone, // Store user's timezone for consistent date formatting in live sync
        deletedAt: null
      }

      await prisma.googleSheetsSync.create({ data: syncData })

      // Update exportOrder on blocks that don't have it set yet
      // This preserves column order for future exports and syncs
      // exportOrder is 1-based for block columns (columns array includes base columns at start)
      const blocksToUpdate = columns
        .filter((col) => col.blockId != null && col.exportOrder == null)
        .map((col) => {
          // Find the actual position in the columns array (accounting for base columns)
          const columnPosition = columns.findIndex(
            (c) => c.blockId === col.blockId
          )
          return {
            blockId: col.blockId!,
            // exportOrder is the position after base columns (1-based for block columns)
            exportOrder: columnPosition - baseColumns.length + 1
          }
        })
        .filter(({ exportOrder }) => exportOrder > 0)

      if (blocksToUpdate.length > 0) {
        try {
          await Promise.all(
            blocksToUpdate.map(({ blockId, exportOrder }) =>
              prisma.block.update({
                where: { id: blockId },
                data: { exportOrder }
              })
            )
          )
        } catch (error) {
          // Best-effort: log error but don't rethrow so the mutation can return success
          // The sheet write and sync have already succeeded at this point
          logger.error(
            { error, blocksToUpdate, journeyId },
            'Failed to update exportOrder on blocks after successful sheet export'
          )
        }
      }

      return { spreadsheetId, spreadsheetUrl, sheetName }
    }
  })
)
