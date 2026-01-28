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
  sanitizeCSVCell,
  sanitizeGoogleSheetsCell
} from '../../../schema/journeyVisitor/export/csv'
import { formatDateYmdInTimeZone } from '../../../schema/journeyVisitor/export/date'
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

interface EventHeaderRecord {
  blockId: string | null
  label: string | null
}

function normalizeLabel(label: string | null | undefined): string {
  return (label ?? '').replace(/\\s+/g, ' ').trim()
}

/**
 * Normalize labels and deduplicate by blockId (keep only one label per block).
 * Keep the first non-empty label encountered for each blockId.
 */
function buildNormalizedBlockHeadersFromEvents(
  headers: EventHeaderRecord[]
): Array<{ blockId: string; label: string }> {
  const headerMap = new Map<string, { blockId: string; label: string }>()

  headers
    .filter((header) => header.blockId != null)
    .forEach((header) => {
      const blockId = header.blockId!
      const normalized = normalizeLabel(header.label)
      if (normalized === '') return
      if (headerMap.has(blockId)) return
      headerMap.set(blockId, { blockId, label: normalized })
    })

  return Array.from(headerMap.values())
}

/**
 * Format a date string for Google Sheets to match export format (YYYY-MM-DD in timezone).
 * If the string cannot be parsed, fall back to the original string.
 */
function formatGoogleSheetsDateFromIso(
  isoOrDate: string,
  timeZone: string
): string {
  const parsed = new Date(isoOrDate)
  if (isNaN(parsed.getTime())) return isoOrDate
  return formatDateYmdInTimeZone(parsed, timeZone)
}

interface MergeGoogleSheetsHeaderParams {
  baseKeys: string[]
  columns: JourneyExportColumn[]
  desiredHeaderKeys: string[]
  existingHeaderRowLabels: string[]
  userTimezone: string
  getCardHeading: (blockId: string | null | undefined) => string
  baseColumnLabelResolver?: BaseColumnLabelResolver
}

interface MergeGoogleSheetsHeaderResult {
  finalHeaderKeys: string[]
  finalHeaderRowLabels: string[]
  writeWidth: number
}

function addLabelMapping(
  map: Map<string, string>,
  label: string,
  key: string
): void {
  const normalized = normalizeLabel(label)
  if (normalized === '') return

  const existing = map.get(normalized)
  if (existing != null && existing !== key) {
    // Ambiguous label -> do not map to avoid incorrect alignment.
    map.set(normalized, '')
    return
  }
  map.set(normalized, key)
}

function mergeGoogleSheetsHeader({
  baseKeys,
  columns,
  desiredHeaderKeys,
  existingHeaderRowLabels,
  userTimezone,
  getCardHeading,
  baseColumnLabelResolver
}: MergeGoogleSheetsHeaderParams): MergeGoogleSheetsHeaderResult {
  const { headerRow: desiredHeaderRowLabels } = buildHeaderRows({
    columns,
    userTimezone,
    getCardHeading,
    baseColumnLabelResolver
  })

  // Map canonical header labels (and sanitized variants) -> column key.
  const headerLabelToKey = new Map<string, string>()
  desiredHeaderRowLabels.forEach((label, index) => {
    const key = desiredHeaderKeys[index] ?? ''
    if (key === '' || label == null) return

    addLabelMapping(headerLabelToKey, label, key)
    addLabelMapping(headerLabelToKey, sanitizeCSVCell(label), key)
    addLabelMapping(headerLabelToKey, sanitizeGoogleSheetsCell(label), key)
  })

  // Map raw column labels -> key (helps reconcile legacy sheets where Multiselect used to be just "Multi")
  // Only map when unique.
  const columnLabelToKey = new Map<string, string>()
  columns.forEach((column) => {
    if (column.key === '' || column.label == null) return
    addLabelMapping(columnLabelToKey, column.label, column.key)
    addLabelMapping(columnLabelToKey, sanitizeCSVCell(column.label), column.key)
    addLabelMapping(
      columnLabelToKey,
      sanitizeGoogleSheetsCell(column.label),
      column.key
    )
  })

  const resolveExistingLabelToKey = (label: string): string => {
    const normalized = normalizeLabel(label)
    if (normalized === '') return ''

    const fromHeader = headerLabelToKey.get(normalized)
    if (fromHeader != null && fromHeader !== '') return fromHeader

    const fromColumn = columnLabelToKey.get(normalized)
    if (fromColumn != null && fromColumn !== '') return fromColumn

    // If existing cell already contains a key, keep it.
    if (desiredHeaderKeys.includes(normalized)) return normalized

    // Preserve legacy/unknown columns as their own keys (placeholder behavior).
    return normalized
  }

  // Ensure base headers exist in the correct order at start.
  const merged: string[] = []
  for (const baseKey of baseKeys) {
    if (baseKey !== '' && !merged.includes(baseKey)) merged.push(baseKey)
  }

  for (const label of existingHeaderRowLabels) {
    const key = resolveExistingLabelToKey(label ?? '')
    if (key === '' || merged.includes(key)) continue
    merged.push(key)
  }

  for (const key of desiredHeaderKeys) {
    if (key === '' || merged.includes(key)) continue
    merged.push(key)
  }

  // Preserve original labels for unknown keys
  const unknownKeyToExistingLabel = new Map<string, string>()
  for (const label of existingHeaderRowLabels) {
    const key = resolveExistingLabelToKey(label ?? '')
    if (key === '') continue
    if (desiredHeaderKeys.includes(key)) continue
    if (!unknownKeyToExistingLabel.has(key)) {
      unknownKeyToExistingLabel.set(key, label ?? '')
    }
  }

  const mergedColumns: JourneyExportColumn[] = merged.map((key) => {
    const existingCol = columns.find((c) => c.key === key)
    if (existingCol != null) return existingCol
    return {
      key,
      label: unknownKeyToExistingLabel.get(key) ?? key,
      blockId: null,
      typename: ''
    }
  })

  const { headerRow: mergedHeaderRowLabels } = buildHeaderRows({
    columns: mergedColumns,
    userTimezone,
    getCardHeading,
    baseColumnLabelResolver
  })

  const existingWidth = existingHeaderRowLabels.length
  const writeWidth = Math.max(existingWidth, mergedHeaderRowLabels.length)
  const paddedHeaderRowLabels =
    writeWidth === mergedHeaderRowLabels.length
      ? mergedHeaderRowLabels
      : [
          ...mergedHeaderRowLabels,
          ...Array.from({
            length: writeWidth - mergedHeaderRowLabels.length
          }).map(() => '')
        ]

  return {
    finalHeaderKeys: merged,
    finalHeaderRowLabels: paddedHeaderRowLabels,
    writeWidth
  }
}

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

  const normalizedBlockHeaders = buildNormalizedBlockHeadersFromEvents(
    blockHeadersResult as EventHeaderRecord[]
  )

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

  let keyForRow = dynamicKey

  if (dynamicKey !== '') {
    // Longest-prefix match to avoid prefix collisions (order-independent)
    // e.g., if we have block IDs "block-1" and "block-1-extended", we need
    // to match the longest one that fits
    const matchedBlock = journeyBlocks
      .filter((b) => dynamicKey === b.id || dynamicKey.startsWith(`${b.id}-`))
      .sort((a, b) => b.id.length - a.id.length)[0]

    if (matchedBlock != null) {
      const existingHeader = normalizedBlockHeaders.find(
        (h: { blockId: string; label: string }) => h.blockId === matchedBlock.id
      )

      if (existingHeader != null) {
        keyForRow = `${existingHeader.blockId}-${existingHeader.label}`
      } else {
        const prefix = `${matchedBlock.id}-`
        const rawLabel = dynamicKey.startsWith(prefix)
          ? dynamicKey.substring(prefix.length)
          : ''
        const normalizedLabel = rawLabel.replace(/\s+/g, ' ').trim()
        keyForRow = `${matchedBlock.id}-${normalizedLabel}`

        if (connectedBlockIds.has(matchedBlock.id)) {
          normalizedBlockHeaders.push({
            blockId: matchedBlock.id,
            label: normalizedLabel
          })
        }
      }
    }
  }

  const updatedColumns = buildJourneyExportColumns({
    baseColumns,
    blockHeaders: normalizedBlockHeaders,
    journeyBlocks,
    orderIndex
  })
  const updatedDesiredHeaderKeys = updatedColumns.map((column) => column.key)

  // Update all synced sheets - use allSettled so one failure doesn't abort others
  const results = await Promise.allSettled(
    syncs.map(async (sync) => {
      // Use sync-specific timezone for header and data formatting
      const syncTimezone = sync.timezone ?? 'UTC'

      const tabName =
        sheetName ?? sync.sheetName ?? `${format(new Date(), 'yyyy-MM-dd')}`
      await ensureSheet({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        sheetTitle: tabName
      })

      const existingHeaderRows = await readValues({
        accessToken,
        spreadsheetId: sync.spreadsheetId,
        range: `${tabName}!A1:ZZ1`
      })
      const existingHeaderRow: string[] = (existingHeaderRows[0] ?? []).map(
        (value) => value ?? ''
      )

      const mergedHeader = mergeGoogleSheetsHeader({
        baseKeys: ['visitorId', 'date'],
        columns: updatedColumns,
        desiredHeaderKeys: updatedDesiredHeaderKeys,
        existingHeaderRowLabels: existingHeaderRow,
        userTimezone: syncTimezone,
        getCardHeading: (blockId: string | null | undefined) =>
          getCardHeading(idToBlock as any, journeyBlocks as any, blockId),
        baseColumnLabelResolver: resolveBaseColumnLabel
      })

      const finalHeaderKeys = mergedHeader.finalHeaderKeys
      const headerWriteWidth = mergedHeader.writeWidth
      const keysByIndex: string[] =
        finalHeaderKeys.length >= headerWriteWidth
          ? finalHeaderKeys
          : [
              ...finalHeaderKeys,
              ...Array.from({
                length: headerWriteWidth - finalHeaderKeys.length
              }).map(() => '')
            ]

      const rowMap: Record<string, string> = {}
      if (visitorId !== '')
        rowMap.visitorId = sanitizeGoogleSheetsCell(visitorId)
      if (createdAt !== '') {
        rowMap.date = sanitizeGoogleSheetsCell(
          formatGoogleSheetsDateFromIso(createdAt, syncTimezone)
        )
      }
      if (keyForRow !== '' && dynamicValue !== '') {
        rowMap[keyForRow] = sanitizeGoogleSheetsCell(dynamicValue)
      }

      const alignedRow: string[] = keysByIndex.map((key) => {
        if (key === '') return ''
        return rowMap[key] ?? ''
      })

      const lastColA1 = columnIndexToA1(headerWriteWidth - 1)
      const headerRange = `${tabName}!A1:${lastColA1}1`
      const sanitizedHeaderRow = mergedHeader.finalHeaderRowLabels.map((cell) =>
        sanitizeGoogleSheetsCell(cell ?? '')
      )

      const existingHeaderRowPadded =
        existingHeaderRow.length >= sanitizedHeaderRow.length
          ? existingHeaderRow
          : [
              ...existingHeaderRow,
              ...Array.from({
                length: sanitizedHeaderRow.length - existingHeaderRow.length
              }).map(() => '')
            ]

      const headerChanged =
        existingHeaderRowPadded.length !== sanitizedHeaderRow.length ||
        sanitizedHeaderRow.some(
          (cell, index) => cell !== (existingHeaderRowPadded[index] ?? '')
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
        const rawCellVal = idColumnValues[i]?.[0] ?? ''
        const cellVal = String(rawCellVal).trim()
        if (visitorId === '') continue

        const normalizedCellVal = cellVal.startsWith("'")
          ? cellVal.slice(1).trim()
          : cellVal
        const tokens = normalizedCellVal
          .split(';')
          .map((t) => t.trim())
          .filter((t) => t !== '')

        if (normalizedCellVal === visitorId || tokens.includes(visitorId)) {
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
          const key = keysByIndex[index] ?? ''
          const existingValue = existingRow[index] ?? ''

          if (key === 'visitorId') {
            return visitorId !== ''
              ? sanitizeGoogleSheetsCell(visitorId)
              : existingValue
          }
          if (key === 'date') {
            if (createdAt === '') return existingValue
            return sanitizeGoogleSheetsCell(
              formatGoogleSheetsDateFromIso(createdAt, syncTimezone)
            )
          }

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
