import { format } from 'date-fns'

import { prisma } from '@core/prisma/journeys/client'

import { getTeamGoogleAccessToken } from '../../../lib/google/googleAuth'
import {
  columnIndexToA1,
  ensureSheet,
  readValues,
  updateRangeValues,
  writeValues
} from '../../../lib/google/sheets'

import { computeConnectedBlockIds } from './connectivity'
import { sanitizeGoogleSheetsCell } from './csv'
import { mergeGoogleSheetsHeader } from './googleSheetsHeader'
import {
  buildNormalizedBlockHeadersFromEvents,
  formatGoogleSheetsDateFromIso,
  getDefaultBaseColumnLabelResolver,
  getDefaultBaseColumns
} from './googleSheetsSyncShared'
import { buildJourneyExportColumns, getCardHeading } from './headings'
import { type SimpleBlock, buildRenderTree, computeOrderIndex } from './order'

// Live Google Sheets sync: append/update row per event when a sync config exists
//
// NOTE: This function is called from event mutations and can be invoked multiple times in quick
// succession for the same visitor. To prevent duplicate rows caused by read-before-append races,
// we serialize sheet writes per (spreadsheetId, sheetTitle, visitorId).
const journeyBlockSelect = {
  id: true,
  typename: true,
  parentBlockId: true,
  parentOrder: true,
  nextBlockId: true,
  action: true,
  content: true,
  deletedAt: true
} as const

const visitorSheetLocks = new Map<string, Promise<void>>()

async function withVisitorSheetLock<T>(
  key: string,
  fn: () => Promise<T>
): Promise<T> {
  const previous = visitorSheetLocks.get(key) ?? Promise.resolve()

  let release!: () => void
  const current = new Promise<void>((resolve) => {
    release = resolve
  })

  const tail = previous.catch(() => undefined).then(() => current)

  visitorSheetLocks.set(key, tail)

  await previous
  try {
    return await fn()
  } finally {
    release()
    if (visitorSheetLocks.get(key) === tail) {
      visitorSheetLocks.delete(key)
    }
  }
}

export async function appendEventToGoogleSheets({
  journeyId,
  teamId,
  row,
  sheetName
}: {
  journeyId: string
  teamId: string
  row: (string | number | null)[]
  sheetName?: string
}): Promise<void> {
  const syncs = await prisma.googleSheetsSync.findMany({
    where: { journeyId, teamId, deletedAt: null }
  })
  if (syncs.length === 0) return

  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: {
      blocks: {
        select: journeyBlockSelect
      }
    }
  })
  if (journey == null) return

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

  const normalizedBlockHeaders =
    buildNormalizedBlockHeadersFromEvents(blockHeadersResult)

  const baseColumns = getDefaultBaseColumns()
  const resolveBaseColumnLabel = getDefaultBaseColumnLabelResolver()

  const { accessToken } = await getTeamGoogleAccessToken(teamId)

  const safe = (value: string | number | null | undefined): string =>
    value == null ? '' : String(value)
  const visitorId = safe(row[0])
  const createdAt = safe(row[1])
  const dynamicKey = safe(row[5])
  const dynamicValue = safe(row[6])

  const updatedColumns = buildJourneyExportColumns({
    baseColumns,
    blockHeaders: normalizedBlockHeaders,
    journeyBlocks,
    orderIndex
  })
  const updatedDesiredHeaderKeys = updatedColumns.map((column) => column.key)

  // Match the incoming event's key to an existing export column key.
  // Do NOT create new columns based on dynamicKey (non-submission events can produce bad keys).
  let keyForRow = ''
  if (dynamicKey !== '') {
    if (updatedDesiredHeaderKeys.includes(dynamicKey)) {
      keyForRow = dynamicKey
    } else {
      const matchedBlock = journeyBlocks
        .filter(
          (b) =>
            connectedBlockIds.has(b.id) &&
            (dynamicKey === b.id || dynamicKey.startsWith(`${b.id}-`))
        )
        .sort((a, b) => b.id.length - a.id.length)[0]

      if (matchedBlock != null) {
        const headerForBlock = normalizedBlockHeaders.find(
          (h) => h.blockId === matchedBlock.id && h.label.trim() !== ''
        )
        if (headerForBlock != null) {
          const candidateKey = `${headerForBlock.blockId}-${headerForBlock.label}`
          if (updatedDesiredHeaderKeys.includes(candidateKey)) {
            keyForRow = candidateKey
          }
        }
      }
    }
  }

  const results = await Promise.allSettled(
    syncs.map(async (sync) => {
      const syncTimezone = sync.timezone ?? 'UTC'

      const tabName =
        sheetName ?? sync.sheetName ?? `${format(new Date(), 'yyyy-MM-dd')}`
      const lockKey = `${sync.spreadsheetId}:${tabName}:${visitorId}`

      await withVisitorSheetLock(lockKey, async () => {
        // Small debounce to coalesce rapid-fire events for same visitor into a single row update.
        // (Prevents read-before-append races that create duplicate rows.)
        await new Promise((resolve) => setTimeout(resolve, 250))

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
          (value: unknown) => (value ?? '') as string
        )

        const getCardHeadingForSync = (blockId: string | null | undefined) =>
          getCardHeading(idToBlock as any, journeyBlocks as any, blockId)

        const mergedHeader = mergeGoogleSheetsHeader({
          baseKeys: ['visitorId', 'date'],
          columns: updatedColumns,
          desiredHeaderKeys: updatedDesiredHeaderKeys,
          existingHeaderRowLabels: existingHeaderRow,
          userTimezone: syncTimezone,
          getCardHeading: getCardHeadingForSync,
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
        const sanitizedHeaderRow = mergedHeader.finalHeaderRowLabels.map(
          (cell) => sanitizeGoogleSheetsCell(cell ?? '')
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
            values: [sanitizedHeaderRow],
            valueInputOption: 'RAW'
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
            (value: unknown) => (value ?? '') as string
          )
          const mergedRow = alignedRow.map((newValue, index) => {
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

            if (newValue === '') return existingValue
            return newValue
          })

          await updateRangeValues({
            accessToken,
            spreadsheetId: sync.spreadsheetId,
            range: `${tabName}!A${foundRowNumber}:${lastColA1}${foundRowNumber}`,
            values: [mergedRow],
            valueInputOption: 'USER_ENTERED'
          })
          return
        }

        await writeValues({
          accessToken,
          spreadsheetId: sync.spreadsheetId,
          sheetTitle: tabName,
          values: [alignedRow],
          append: true,
          valueInputOption: 'USER_ENTERED'
        })
      })
    })
  )

  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const sync = syncs[index]
      console.error(
        `Failed to sync event to Google Sheet (spreadsheetId: ${sync.spreadsheetId}, sheetName: ${sync.sheetName}):`,
        result.reason
      )
    }
  })

  // If all syncs failed, throw so callers (e.g. the worker) can retry.
  const allFailed =
    results.length > 0 && results.every((r) => r.status === 'rejected')
  if (allFailed) {
    throw new Error(
      `All Google Sheets syncs failed: ${syncs.map((s) => s.spreadsheetId).join(', ')}`
    )
  }
}
