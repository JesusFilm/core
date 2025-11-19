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

import {
  getAncestorByType as getAncestorByTypeHelper,
  getCardHeading as getCardHeadingHelper
} from './export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from './export/order'
import { JourneyVisitorExportSelect } from './inputs'

// Sanitize CSV cell while preserving leading whitespace and neutralizing formulas
function sanitizeCSVCell(value: string): string {
  if (value == null) return ''
  const str = typeof value === 'string' ? value : String(value)

  // Preserve leading whitespace; inspect first non-whitespace character
  const leadingMatch = str.match(/^\s*/)
  const leadingWhitespace = leadingMatch != null ? leadingMatch[0] : ''
  const rest = str.slice(leadingWhitespace.length)

  if (rest.length === 0) return str
  // If already explicitly text (leading apostrophe), leave unchanged
  if (rest[0] === "'") return str
  const first = rest[0]
  if (first === '=' || first === '+' || first === '-' || first === '@') {
    return `${leadingWhitespace}'${rest}`
  }
  // Heuristic: treat phone-like numeric strings as text to preserve leading zeros
  // Strip common formatting characters and check if remaining are digits (optionally prefixed by '+')
  const compact = rest.replace(/[\s().-]/g, '')
  const isNumericLike = /^\+?\d{7,}$/.test(compact)
  if (isNumericLike) {
    return `${leadingWhitespace}'${rest}`
  }
  return str
}

// Format a Date as YYYY-MM-DD for a specific IANA timezone
function formatDateYmdInTimeZone(date: Date, timeZone: string): string {
  try {
    return date.toLocaleDateString('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  } catch {
    return date.toISOString().slice(0, 10)
  }
}

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
  deletedAt: true
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
        if (event.blockId && event.label) {
          const key = `${event.blockId}-${event.label}`
          const eventValue = event.value ?? ''
          if (!eventValuesByKey.has(key)) {
            eventValuesByKey.set(key, [])
          }
          eventValuesByKey.get(key)!.push(eventValue)
        }
      })
      // Join values with a fixed separator and sanitize for CSV
      eventValuesByKey.forEach((values, key) => {
        const sanitizedValues = values.map((value) => sanitizeCSVCell(value))
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

      const eventWhere: Prisma.EventWhereInput = {
        journeyId: journeyId,
        blockId: { not: null },
        label: { not: null }
      }
      if (filter?.typenames && filter.typenames.length > 0) {
        eventWhere.typename = { in: filter.typenames }
      }
      if (filter?.periodRangeStart || filter?.periodRangeEnd) {
        eventWhere.createdAt = {}
        if (filter.periodRangeStart) {
          // Parse timezone-aware date if needed
          const startDate =
            filter.periodRangeStart instanceof Date
              ? filter.periodRangeStart
              : new Date(filter.periodRangeStart)
          eventWhere.createdAt.gte = startDate
        }
        if (filter.periodRangeEnd) {
          const endDate =
            filter.periodRangeEnd instanceof Date
              ? filter.periodRangeEnd
              : new Date(filter.periodRangeEnd)
          eventWhere.createdAt.lte = endDate
        }
      }

      // Get unique blockId_label combinations for headers using Prisma
      const blockHeadersResult = await prisma.event.findMany({
        where: eventWhere,
        select: {
          blockId: true,
          label: true
        },
        distinct: ['blockId', 'label']
      })

      const getAncestorByType = (
        blockId: string | null | undefined,
        type: string
      ) => getAncestorByTypeHelper(idToBlock as any, blockId, type)
      const getCardHeading = (blockId: string | null | undefined) =>
        getCardHeadingHelper(idToBlock as any, journeyBlocks as any, blockId)

      function compareHeaders(
        a: { blockId: string | null },
        b: { blockId: string | null }
      ): number {
        const aOrder =
          a.blockId != null
            ? (orderIndex.get(a.blockId) ?? Number.MAX_SAFE_INTEGER)
            : Number.MAX_SAFE_INTEGER
        const bOrder =
          b.blockId != null
            ? (orderIndex.get(b.blockId) ?? Number.MAX_SAFE_INTEGER)
            : Number.MAX_SAFE_INTEGER
        if (aOrder !== bOrder) return aOrder - bOrder
        return (a.blockId ?? '').localeCompare(b.blockId ?? '')
      }
      // Build headers: visitorId + date + dynamic block columns grouped by Card and ordered by position
      const blockHeaders = blockHeadersResult
        .sort(compareHeaders)
        .map((item) => ({
          key: `${item.blockId!}-${item.label!}`,
          label: item.label!,
          blockId: item.blockId!,
          typename:
            journeyBlocks.find((b) => b.id === item.blockId)?.typename ?? ''
        }))
      const columns = [
        { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
        { key: 'date', label: 'Date', blockId: null, typename: '' },
        ...(filter?.typenames == null || filter.typenames.length > 0
          ? blockHeaders
          : [])
      ].filter((value) => value != null)

      // Build header rows
      // Row 1: Card Heading
      // Row 2: Label/Type (Poll, Name, Response, etc)
      // First, count polls and multiselects per card for numbering
      const cardPollCounts = new Map<
        string,
        { pollCount: number; multiselectCount: number }
      >()

      blockHeaders.forEach((header) => {
        const cardBlock = getAncestorByType(header.blockId, 'CardBlock')
        if (cardBlock) {
          const cardId = cardBlock.id
          if (!cardPollCounts.has(cardId)) {
            cardPollCounts.set(cardId, { pollCount: 0, multiselectCount: 0 })
          }
          const counts = cardPollCounts.get(cardId)!
          if (header.typename === 'RadioQuestionBlock') {
            counts.pollCount++
          } else if (header.typename === 'MultiselectBlock') {
            counts.multiselectCount++
          }
        }
      })

      // Track current counts for each card as we build the label row
      const currentCardCounts = new Map<
        string,
        { pollCount: number; multiselectCount: number }
      >()

      const labelRow = columns.map((col) => {
        if (col.key === 'visitorId') return 'Visitor ID'
        if (col.key === 'date')
          return userTimezone !== 'UTC' && userTimezone !== ''
            ? `Date (${userTimezone})`
            : 'Date'

        const cardBlock = getAncestorByType(col.blockId, 'CardBlock')
        if (
          cardBlock &&
          (col.typename === 'RadioQuestionBlock' ||
            col.typename === 'MultiselectBlock')
        ) {
          const cardId = cardBlock.id
          if (!currentCardCounts.has(cardId)) {
            currentCardCounts.set(cardId, {
              pollCount: 0,
              multiselectCount: 0
            })
          }

          const counts = currentCardCounts.get(cardId)!
          const totalCounts = cardPollCounts.get(cardId)!

          if (col.typename === 'RadioQuestionBlock') {
            counts.pollCount++
            // Only add number if there are multiple polls on this card
            return totalCounts.pollCount > 1
              ? `Poll ${counts.pollCount}`
              : 'Poll'
          } else if (col.typename === 'MultiselectBlock') {
            counts.multiselectCount++
            // Only add number if there are multiple multiselects on this card
            return totalCounts.multiselectCount > 1
              ? `Multiselect ${counts.multiselectCount}`
              : 'Multiselect'
          }
        }

        // Use the label from the event (e.g., "What is your name?")
        return col.label
      })

      const cardHeadingRow = columns.map((col) => {
        if (col.key === 'visitorId') return 'Visitor ID'
        if (col.key === 'date')
          return userTimezone !== 'UTC' && userTimezone !== ''
            ? `Date (${userTimezone})`
            : 'Date'
        // Get the highest order heading of the card
        return getCardHeading(col.blockId)
      })

      // Compute the desired header keys for this export
      const desiredHeader = columns.map((c) => c.key)

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
      let finalCardHeadingRow = cardHeadingRow
      let finalLabelRow = labelRow
      if (destination.mode === 'existing') {
        await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })
        // Read first two rows (card heading and label rows)
        const headerRes = await readValues({
          accessToken,
          spreadsheetId,
          range: `${sheetName}!A1:ZZ2`
        })
        const existingCardHeadingRow: string[] = (headerRes[0] ?? []).map(
          (v) => v ?? ''
        )
        const existingLabelRow: string[] = (headerRes[1] ?? []).map(
          (v) => v ?? ''
        )
        if (existingLabelRow.length > 0) {
          // Extract keys from existing label row
          // The label row contains display labels, we need to map them back to column keys
          // Note: labels in the sheet were written through sanitizeCSVCell, so we need to
          // compare against both raw and sanitized labels to match correctly
          const existingHeader: string[] = existingLabelRow.map((label) => {
            // Skip empty labels (no header columns)
            if (label.trim() === '') return ''

            // Try to find matching column by raw label first
            let matchingCol = columns.find((c) => c.label === label)
            // If not found, try matching against sanitized label (since sheet labels were sanitized)
            if (!matchingCol) {
              matchingCol = columns.find(
                (c) => sanitizeCSVCell(c.label) === label
              )
            }
            if (matchingCol) return matchingCol.key

            // Check if it's a standard column label (handle sanitized versions too)
            const sanitizedVisitorId = sanitizeCSVCell('Visitor ID')
            if (label === 'Visitor ID' || label === sanitizedVisitorId) {
              return 'visitorId'
            }
            // Date labels may have timezone suffix, check if it starts with sanitized "Date"
            const sanitizedDate = sanitizeCSVCell('Date')
            if (
              label === 'Date' ||
              label.startsWith('Date') ||
              label === sanitizedDate ||
              label.startsWith(sanitizedDate)
            ) {
              return 'date'
            }

            // If not found, check if it's a key directly
            if (desiredHeader.includes(label)) return label

            // For existing columns not in current export, use label as key
            // This handles legacy columns that may not match current structure
            return label
          })

          // Ensure base headers exist in the correct order at start
          // Filter out empty strings (no header columns) before merging
          const base: string[] = ['visitorId', 'date']
          const merged: string[] = []
          for (const b of base) if (!merged.includes(b)) merged.push(b)
          for (const h of existingHeader)
            if (h !== '' && h.trim() !== '' && !merged.includes(h))
              merged.push(h)
          for (const h of desiredHeader)
            if (h !== '' && h.trim() !== '' && !merged.includes(h))
              merged.push(h)
          finalHeader = merged

          // Rebuild header rows for merged columns
          const mergedColumns = finalHeader.map((key) => {
            // Handle empty header columns (no header columns)
            if (key === '' || key.trim() === '') {
              return {
                key: '',
                label: '',
                blockId: null,
                typename: ''
              }
            }
            const existingCol = columns.find((c) => c.key === key)
            if (existingCol) return existingCol
            // For columns not in current export, create placeholder
            return {
              key,
              label: key,
              blockId: null,
              typename: ''
            }
          })

          // Rebuild card heading and label rows for merged columns
          const mergedCardPollCounts = new Map<
            string,
            { pollCount: number; multiselectCount: number }
          >()
          mergedColumns.forEach((col) => {
            if (col.blockId) {
              const cardBlock = getAncestorByType(col.blockId, 'CardBlock')
              if (cardBlock) {
                const cardId = cardBlock.id
                if (!mergedCardPollCounts.has(cardId)) {
                  mergedCardPollCounts.set(cardId, {
                    pollCount: 0,
                    multiselectCount: 0
                  })
                }
                const counts = mergedCardPollCounts.get(cardId)!
                if (col.typename === 'RadioQuestionBlock') {
                  counts.pollCount++
                } else if (col.typename === 'MultiselectBlock') {
                  counts.multiselectCount++
                }
              }
            }
          })

          const mergedCurrentCardCounts = new Map<
            string,
            { pollCount: number; multiselectCount: number }
          >()

          finalLabelRow = mergedColumns.map((col) => {
            // Handle empty header columns
            if (col.key === '' || col.key.trim() === '') return ''
            if (col.key === 'visitorId') return 'Visitor ID'
            if (col.key === 'date')
              return userTimezone !== 'UTC' && userTimezone !== ''
                ? `Date (${userTimezone})`
                : 'Date'

            const cardBlock = getAncestorByType(col.blockId, 'CardBlock')
            if (
              cardBlock &&
              (col.typename === 'RadioQuestionBlock' ||
                col.typename === 'MultiselectBlock')
            ) {
              const cardId = cardBlock.id
              if (!mergedCurrentCardCounts.has(cardId)) {
                mergedCurrentCardCounts.set(cardId, {
                  pollCount: 0,
                  multiselectCount: 0
                })
              }

              const counts = mergedCurrentCardCounts.get(cardId)!
              const totalCounts = mergedCardPollCounts.get(cardId)!

              if (col.typename === 'RadioQuestionBlock') {
                counts.pollCount++
                return totalCounts.pollCount > 1
                  ? `Poll ${counts.pollCount}`
                  : 'Poll'
              } else if (col.typename === 'MultiselectBlock') {
                counts.multiselectCount++
                return totalCounts.multiselectCount > 1
                  ? `Multiselect ${counts.multiselectCount}`
                  : 'Multiselect'
              }
            }

            return col.label
          })

          finalCardHeadingRow = mergedColumns.map((col, index) => {
            // Handle empty header columns
            if (col.key === '' || col.key.trim() === '') return ''
            // Use existing card heading if available and column matches
            if (index < existingCardHeadingRow.length) {
              const existingHeading = existingCardHeadingRow[index]
              // Only use existing heading if it's not empty and column is not a standard column
              if (
                existingHeading !== '' &&
                col.key !== 'visitorId' &&
                col.key !== 'date'
              ) {
                return existingHeading
              }
            }
            // Otherwise generate new heading
            if (col.key === 'visitorId') return 'Visitor ID'
            if (col.key === 'date')
              return userTimezone !== 'UTC' && userTimezone !== ''
                ? `Date (${userTimezone})`
                : 'Date'
            return getCardHeading(col.blockId)
          })
        }
      }

      // Build data rows aligned to finalHeader with sanitization
      const sanitizedCardHeadingRow = finalCardHeadingRow.map((cell) =>
        sanitizeCSVCell(cell)
      )
      const sanitizedLabelRow = finalLabelRow.map((cell) =>
        sanitizeCSVCell(cell)
      )
      const values: (string | null)[][] = [
        sanitizedCardHeadingRow,
        sanitizedLabelRow
      ]
      for await (const row of getJourneyVisitors(
        journeyId,
        eventWhere,
        userTimezone
      )) {
        const aligned = finalHeader.map((k) => {
          // Handle empty header columns (no header columns)
          if (k === '' || k.trim() === '') return ''
          const value = row[k] ?? ''
          return sanitizeCSVCell(value)
        })
        values.push(aligned)
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
        deletedAt: null
      }

      await prisma.googleSheetsSync.create({ data: syncData })

      return { spreadsheetId, spreadsheetUrl, sheetName }
    }
  })
)
