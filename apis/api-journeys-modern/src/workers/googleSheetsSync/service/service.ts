import { Job } from 'bullmq'
import { format } from 'date-fns'
import { Logger } from 'pino'

import { prisma } from '@core/prisma/journeys/client'

import { getTeamGoogleAccessToken } from '../../../lib/google/googleAuth'
import {
  columnIndexToA1,
  ensureSheet,
  readValues,
  updateRangeValues,
  writeValues
} from '../../../lib/google/sheets'
import { computeConnectedBlockIds } from '../../../schema/journeyVisitor/export/connectivity'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows,
  buildJourneyExportColumns,
  getCardHeading
} from '../../../schema/journeyVisitor/export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from '../../../schema/journeyVisitor/export/order'
import { GoogleSheetsSyncJobData } from '../queue'

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

export async function service(
  job: Job<GoogleSheetsSyncJobData>,
  logger?: Logger
): Promise<void> {
  const { journeyId, teamId, row, sheetName, syncs } = job.data

  // syncs are passed from the queue to minimize DB calls
  if (syncs.length === 0) {
    return
  }

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: {
      blocks: {
        select: journeyBlockSelect
      }
    }
  })
  if (journey == null) {
    return
  }

  const journeyBlocks = journey.blocks.filter(
    (block) => block.deletedAt == null
  )
  const idToBlock = new Map(journeyBlocks.map((block) => [block.id, block]))
  const simpleBlocks: SimpleBlock[] = journeyBlocks.map((block) => ({
    id: block.id,
    typename: block.typename,
    parentBlockId: block.parentBlockId ?? null,
    parentOrder: block.parentOrder ?? null
  }))
  const treeRoots = buildRenderTree(simpleBlocks)
  const orderIndex = computeOrderIndex(treeRoots)

  // Apply connectivity filter to only include blocks from connected steps
  const connectedBlockIds = computeConnectedBlockIds({ journeyBlocks })

  const blockHeadersResult = await prisma.event.findMany({
    where: {
      journeyId,
      blockId: { in: Array.from(connectedBlockIds) },
      // Only include submission events
      typename: {
        in: [
          'RadioQuestionSubmissionEvent',
          'MultiselectSubmissionEvent',
          'TextResponseSubmissionEvent',
          'SignUpSubmissionEvent'
        ]
      }
    },
    select: {
      blockId: true,
      label: true
    },
    distinct: ['blockId', 'label'],
    // Order by createdAt to ensure consistent "first" label per blockId
    orderBy: { createdAt: 'asc' }
  })

  // Normalize labels and deduplicate by blockId (keep only first label per blockId)
  // This prevents creating multiple columns for the same block when events have different labels
  const headerMap = new Map<string, { blockId: string; label: string }>()
  blockHeadersResult
    .filter((header) => header.blockId != null)
    .forEach((header) => {
      const normalizedLabel = (header.label ?? '').replace(/\s+/g, ' ').trim()
      // Key by blockId only to ensure one column per block
      const key = header.blockId!
      // Only add if not already present (keeps first label encountered for each blockId)
      if (!headerMap.has(key)) {
        headerMap.set(key, {
          blockId: header.blockId!,
          label: normalizedLabel
        })
      }
    })

  const baseColumns: JourneyExportColumn[] = [
    { key: 'visitorId', label: 'Visitor ID', blockId: null, typename: '' },
    { key: 'date', label: 'Date', blockId: null, typename: '' }
  ]

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

  const { accessToken } = await getTeamGoogleAccessToken(teamId)

  const safe = (value: string | number | null | undefined): string =>
    value == null ? '' : String(value)
  const visitorId = safe(row[0])
  const createdAt = safe(row[1])
  const dynamicKey = safe(row[5])
  const dynamicValue = safe(row[6])

  // Extract blockId and find the column key for this event
  // The column key is used for matching row data to columns
  let eventColumnKey: string | null = null
  if (dynamicKey !== '') {
    // Longest-prefix match to avoid prefix collisions (order-independent)
    // e.g., if we have block IDs "block-1" and "block-1-extended", we need
    // to match the longest one that fits
    const matchedBlock = journeyBlocks
      .filter((b) => dynamicKey === b.id || dynamicKey.startsWith(`${b.id}-`))
      .sort((a, b) => b.id.length - a.id.length)[0]

    if (matchedBlock != null) {
      // Check if there's already a header entry for this blockId
      const existingHeader = headerMap.get(matchedBlock.id)

      if (existingHeader != null) {
        // Use the existing column key for this blockId
        eventColumnKey = `${existingHeader.blockId}-${existingHeader.label}`
      } else {
        // No existing column for this block - normalize and add to headerMap
        const prefix = `${matchedBlock.id}-`
        const rawLabel = dynamicKey.startsWith(prefix)
          ? dynamicKey.substring(prefix.length)
          : ''
        // Normalize label to match how historical headers are normalized
        const normalizedLabel = rawLabel.replace(/\s+/g, ' ').trim()
        eventColumnKey = `${matchedBlock.id}-${normalizedLabel}`

        if (connectedBlockIds.has(matchedBlock.id)) {
          headerMap.set(matchedBlock.id, {
            blockId: matchedBlock.id,
            label: normalizedLabel
          })
        }
      }
    }
  }

  // Rebuild columns with the potentially updated headerMap
  const updatedBlockHeaders = Array.from(headerMap.values())
  const updatedColumns = buildJourneyExportColumns({
    baseColumns,
    blockHeaders: updatedBlockHeaders,
    journeyBlocks,
    orderIndex
  })
  const updatedFinalHeader = updatedColumns.map((column) => column.key)

  // Update all synced sheets - use allSettled so one failure doesn't abort others
  const results = await Promise.allSettled(
    syncs.map(async (sync) => {
      // Use sync-specific timezone for header and data formatting
      const syncTimezone = sync.timezone ?? 'UTC'

      const { headerRow } = buildHeaderRows({
        columns: updatedColumns,
        userTimezone: syncTimezone,
        getCardHeading: (blockId) =>
          getCardHeading(idToBlock as any, journeyBlocks as any, blockId),
        baseColumnLabelResolver: resolveBaseColumnLabel
      })

      const sanitizedHeaderRow = headerRow.map((cell) => cell ?? '')

      const rowMap: Record<string, string> = {}
      if (visitorId !== '') rowMap.visitorId = visitorId
      if (createdAt !== '') rowMap.date = createdAt

      // Store event data with the column key
      // Column order is determined by exportOrder, matching uses key
      if (eventColumnKey != null && dynamicValue !== '') {
        rowMap[eventColumnKey] = dynamicValue
      }

      // Align row to columns using column key
      const alignedRow = updatedColumns.map((col) => rowMap[col.key] ?? '')
      const lastColA1 = columnIndexToA1(updatedFinalHeader.length - 1)

      const tabName =
        sheetName ?? sync.sheetName ?? `${format(new Date(), 'yyyy-MM-dd')}`
      await ensureSheet({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        sheetTitle: tabName
      })

      const headerRange = `${tabName}!A1:${columnIndexToA1(
        updatedFinalHeader.length - 1
      )}1`
      const existingHeaderRows = await readValues({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        range: headerRange
      })
      const existingHeaderRow: string[] = (existingHeaderRows[0] ?? []).map(
        (value) => value ?? ''
      )

      const headerChanged =
        existingHeaderRow.length !== sanitizedHeaderRow.length ||
        sanitizedHeaderRow.some(
          (cell, index) => cell !== (existingHeaderRow[index] ?? '')
        )

      if (headerChanged) {
        await updateRangeValues({
          accessToken,
          spreadsheetId: sync.spreadsheetId,
          range: headerRange,
          values: [sanitizedHeaderRow]
        })
      }

      const firstDataRow = 2
      const idColumnRange = `${tabName}!A${firstDataRow}:A1000000`
      const idColumnValues = await readValues({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        range: idColumnRange
      })
      let foundRowNumber: number | null = null
      for (let i = 0; i < idColumnValues.length; i++) {
        const cellVal = idColumnValues[i]?.[0] ?? ''
        if (cellVal === visitorId && visitorId !== '') {
          foundRowNumber = firstDataRow + i
          break
        }
      }

      if (foundRowNumber != null) {
        const existingRowRes = await readValues({
          accessToken,
          spreadsheetId: sync.spreadsheetId,
          range: `${tabName}!A${foundRowNumber}:${lastColA1}${foundRowNumber}`
        })
        const existingRow: string[] = (existingRowRes[0] ?? []).map(
          (value) => value ?? ''
        )
        const mergedRow = alignedRow.map((value, index) => {
          const existingValue = existingRow[index] ?? ''
          // If new value is empty, keep existing
          if (value === '') return existingValue
          // If existing value is empty, use new value
          if (existingValue === '') return value
          // Both values exist: split both by ';', merge unique parts, and rejoin
          const existingParts = existingValue.split(';').map((s) => s.trim())
          const newParts = value.split(';').map((s) => s.trim())
          const seen = new Set<string>()
          const merged: string[] = []
          // Add existing parts first (preserving order)
          for (const part of existingParts) {
            if (part !== '' && !seen.has(part)) {
              seen.add(part)
              merged.push(part)
            }
          }
          // Add new parts that aren't already present
          for (const part of newParts) {
            if (part !== '' && !seen.has(part)) {
              seen.add(part)
              merged.push(part)
            }
          }
          return merged.join('; ')
        })

        await updateRangeValues({
          accessToken,
          spreadsheetId: sync.spreadsheetId,
          range: `${tabName}!A${foundRowNumber}:${lastColA1}${foundRowNumber}`,
          values: [mergedRow]
        })
        return
      }

      await writeValues({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        sheetTitle: tabName,
        values: [alignedRow],
        append: true
      })
    })
  )

  // Log errors for any failed syncs and throw if all failed
  const failures: Array<{
    spreadsheetId: string
    sheetName: string | null
    error: unknown
  }> = []
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const sync = syncs[index]
      failures.push({
        spreadsheetId: sync.spreadsheetId,
        sheetName: sync.sheetName,
        error: result.reason
      })
      logger?.error(
        {
          spreadsheetId: sync.spreadsheetId,
          sheetName: sync.sheetName,
          error: result.reason
        },
        'Failed to sync event to Google Sheet'
      )
    }
  })

  // If all syncs failed, throw to trigger retry
  if (failures.length === syncs.length && syncs.length > 0) {
    throw new Error(
      `All Google Sheets syncs failed: ${failures.map((f) => f.spreadsheetId).join(', ')}`
    )
  }
}
