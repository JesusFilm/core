import { Job } from 'bullmq'
import { Logger } from 'pino'

import { Prisma, prisma } from '@core/prisma/journeys/client'

import { getIntegrationGoogleAccessToken } from '../../../lib/google/googleAuth'
import {
  clearSheet,
  ensureSheet,
  writeValues
} from '../../../lib/google/sheets'
import { computeConnectedBlockIds } from '../../../schema/journeyVisitor/export/connectivity'
import { sanitizeGoogleSheetsCell } from '../../../schema/journeyVisitor/export/csv'
import { formatDateYmdInTimeZone } from '../../../schema/journeyVisitor/export/date'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows,
  buildJourneyExportColumns,
  getCardHeading as getCardHeadingHelper
} from '../../../schema/journeyVisitor/export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from '../../../schema/journeyVisitor/export/order'
import { GoogleSheetsSyncBackfillJobData } from '../queue'

const journeyBlockSelect = {
  id: true,
  typename: true,
  parentBlockId: true,
  parentOrder: true,
  nextBlockId: true,
  action: true,
  content: true,
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
      const date = formatDateYmdInTimeZone(journeyVisitor.createdAt, timezone)
      const row: JourneyVisitorExportRow = {
        visitorId: journeyVisitor.visitor.id,
        date
      }
      const eventValuesByKey = new Map<string, string[]>()
      journeyVisitor.events.forEach((event) => {
        if (event.blockId) {
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

/**
 * Backfill service: clears existing sheet data and re-exports all events.
 * This runs inside the worker to prevent locking issues with concurrent operations.
 */
export async function backfillService(
  job: Job<GoogleSheetsSyncBackfillJobData>,
  logger?: Logger
): Promise<void> {
  const {
    journeyId,
    teamId,
    syncId,
    spreadsheetId,
    sheetName,
    timezone,
    integrationId
  } = job.data

  // Verify the sync still exists and is active
  const sync = await prisma.googleSheetsSync.findFirst({
    where: {
      id: syncId,
      journeyId,
      teamId,
      spreadsheetId,
      sheetName,
      deletedAt: null
    }
  })

  if (sync == null) {
    logger?.warn(
      { syncId, journeyId, spreadsheetId, sheetName },
      'Sync not found or deleted, skipping backfill'
    )
    return
  }

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      blocks: {
        select: journeyBlockSelect,
        orderBy: { updatedAt: 'asc' }
      }
    }
  })

  if (journey == null) {
    logger?.warn({ journeyId }, 'Journey not found, skipping backfill')
    return
  }

  const userTimezone = timezone || 'UTC'

  // Build block structures
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

  // Apply connectivity filter
  const connectedBlockIds = computeConnectedBlockIds({ journeyBlocks })

  const eventWhere: Prisma.EventWhereInput = {
    journeyId,
    blockId: { in: Array.from(connectedBlockIds) },
    typename: {
      in: [
        'RadioQuestionSubmissionEvent',
        'MultiselectSubmissionEvent',
        'TextResponseSubmissionEvent',
        'SignUpSubmissionEvent'
      ]
    }
  }

  // Get unique blockId_label combinations for headers
  const blockHeadersResult = await prisma.event.findMany({
    where: eventWhere,
    select: {
      blockId: true,
      label: true
    },
    distinct: ['blockId', 'label'],
    orderBy: { createdAt: 'asc' }
  })

  // Normalize labels and deduplicate by blockId
  const headerMap = new Map<string, { blockId: string; label: string }>()
  blockHeadersResult
    .filter((header) => header.blockId != null)
    .forEach((header) => {
      const normalizedLabel = (header.label ?? '').replace(/\s+/g, ' ').trim()
      const key = header.blockId!
      if (!headerMap.has(key)) {
        headerMap.set(key, {
          blockId: header.blockId!,
          label: normalizedLabel
        })
      }
    })
  const normalizedBlockHeaders = Array.from(headerMap.values())

  const getCardHeading = (blockId: string | null | undefined) =>
    getCardHeadingHelper(idToBlock as any, journeyBlocks as any, blockId)

  const baseColumns: JourneyExportColumn[] = [
    { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
    { key: 'date', label: 'Date', blockId: null, typename: '' }
  ]
  const columns = buildJourneyExportColumns({
    baseColumns,
    blockHeaders: normalizedBlockHeaders,
    journeyBlocks,
    orderIndex
  })

  const resolveBaseColumnLabel: BaseColumnLabelResolver = ({
    column,
    userTimezone
  }) => {
    if (column.key === 'visitorId') return 'Visitor ID'
    if (column.key === 'date') {
      return userTimezone !== 'UTC' && userTimezone !== ''
        ? `Date (${userTimezone})`
        : 'Date'
    }
    return column.label
  }

  const { headerRow } = buildHeaderRows({
    columns,
    userTimezone,
    getCardHeading,
    baseColumnLabelResolver: resolveBaseColumnLabel
  })

  const finalHeader = columns.map((c) => c.key)

  // Get access token
  const { accessToken } = await getIntegrationGoogleAccessToken(integrationId)

  // Ensure sheet exists
  await ensureSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })

  // Clear existing data
  await clearSheet({ accessToken, spreadsheetId, sheetTitle: sheetName })

  // Build data rows
  const sanitizedHeaderRow = headerRow.map((cell) =>
    sanitizeGoogleSheetsCell(cell)
  )

  const values: (string | null)[][] = [sanitizedHeaderRow]
  for await (const row of getJourneyVisitors(
    journeyId,
    eventWhere,
    userTimezone
  )) {
    const rowLookup = new Map<string, string>()
    for (const [key, value] of Object.entries(row)) {
      rowLookup.set(key, sanitizeGoogleSheetsCell(value))
    }
    const aligned = finalHeader.map((key) => rowLookup.get(key) ?? '')
    values.push(aligned)
  }

  // Write all data at once
  await writeValues({
    accessToken,
    spreadsheetId,
    sheetTitle: sheetName,
    values,
    append: false
  })

  // Update exportOrder on blocks that don't have it set yet.
  // This ensures columns maintain their positions for future syncs.
  const blocksToUpdate = columns
    .filter((col) => col.blockId != null && col.exportOrder == null)
    .map((col) => {
      const columnPosition = columns.findIndex((c) => c.blockId === col.blockId)
      return {
        blockId: col.blockId!,
        // exportOrder is 1-indexed relative to block columns (after base columns)
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
      logger?.error(
        { error, blocksToUpdate, journeyId },
        'Failed to update exportOrder on blocks after backfill'
      )
    }
  }

  logger?.info(
    {
      syncId,
      journeyId,
      spreadsheetId,
      sheetName,
      rowCount: values.length - 1
    },
    'Backfill completed successfully'
  )
}
