import { format } from 'date-fns'
import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

import { getTeamGoogleAccessToken } from '../../lib/google/googleAuth'
import {
  columnIndexToA1,
  ensureSheet,
  readValues,
  updateRangeValues,
  writeValues
} from '../../lib/google/sheets'
import { computeConnectedBlockIds } from '../journeyVisitor/export/connectivity'
import {
  type BaseColumnLabelResolver,
  type JourneyExportColumn,
  buildHeaderRows,
  buildJourneyExportColumns,
  getCardHeading
} from '../journeyVisitor/export/headings'
import {
  type SimpleBlock,
  buildRenderTree,
  computeOrderIndex
} from '../journeyVisitor/export/order'

// Queue for visitor interaction emails
let emailQueue: any
try {
  // Avoid requiring Redis in tests
  if (process.env.NODE_ENV !== 'test') {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    emailQueue = require('../../workers/emailEvents/queue').queue
  }
} catch {
  emailQueue = null
}

// Test helper to inject a mock queue
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setEmailQueueForTests(mockQueue: any): void {
  emailQueue = mockQueue
}

const TWO_MINUTES = 2 * 60 * 1000
export const ONE_DAY = 24 * 60 * 60 // in seconds

export async function validateBlockEvent(
  userId: string,
  blockId: string,
  stepId: string | null = null
): Promise<{
  visitor: Visitor
  journeyVisitor: JourneyVisitor
  journeyId: string
  teamId: string
  block: Block
}> {
  const block = await prisma.block.findUnique({
    where: { id: blockId }
  })

  if (block == null) {
    throw new GraphQLError('Block does not exist', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  const journeyId = block.journeyId

  // Fetch journey to get teamId
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    select: { teamId: true }
  })

  if (journey == null) {
    throw new GraphQLError('Journey does not exist', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  // Get visitor by userId and check if they have access to this journey
  const visitor = await prisma.visitor.findFirst({
    where: { userId }
  })

  if (visitor == null) {
    throw new GraphQLError('Visitor does not exist', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  // Get or create journey visitor
  let journeyVisitor = await prisma.journeyVisitor.findUnique({
    where: {
      journeyId_visitorId: {
        journeyId,
        visitorId: visitor.id
      }
    }
  })

  if (journeyVisitor == null) {
    // Create journey visitor if it doesn't exist
    journeyVisitor = await prisma.journeyVisitor.create({
      data: {
        journeyId,
        visitorId: visitor.id
      }
    })
  }

  // Validate step if provided
  if (stepId != null) {
    const validStep = await validateBlock(stepId, journeyId, 'journeyId')

    if (!validStep) {
      throw new GraphQLError(
        `Step ID ${stepId} does not exist on Journey with ID ${journeyId}`,
        { extensions: { code: 'NOT_FOUND' } }
      )
    }
  }

  return { visitor, journeyVisitor, journeyId, teamId: journey.teamId, block }
}

export async function validateBlock(
  id: string | null | undefined,
  value: string | null,
  type: 'parentBlockId' | 'journeyId' = 'parentBlockId'
): Promise<boolean> {
  const block =
    id != null
      ? await prisma.block.findFirst({
          where: { id, deletedAt: null }
        })
      : null

  return block != null ? block[type] === value : false
}

export async function getByUserIdAndJourneyId(
  userId: string,
  journeyId: string
): Promise<{
  visitor: Visitor
  journeyVisitor: JourneyVisitor
} | null> {
  const visitor = await prisma.visitor.findFirst({
    where: { userId }
  })

  if (visitor == null) {
    return null
  }

  const journeyVisitor = await prisma.journeyVisitor.findUnique({
    where: {
      journeyId_visitorId: {
        journeyId,
        visitorId: visitor.id
      }
    }
  })

  if (journeyVisitor == null) {
    return null
  }

  return { visitor, journeyVisitor }
}

// Helper function to get visitor and journey IDs
export async function getEventContext(blockId: string, journeyId?: string) {
  const context = await prisma.block.findUnique({
    where: { id: blockId },
    select: {
      journey: {
        select: { id: true }
      }
    }
  })

  if (!context?.journey) {
    throw new GraphQLError('Block or Journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }

  return {
    journeyId: journeyId || context.journey.id
  }
}

// Helper function to get or create visitor
export async function getOrCreateVisitor(context: any): Promise<string> {
  // For now, return a placeholder visitor ID
  // In a real implementation, this would handle visitor creation/lookup
  return 'visitor-placeholder-id'
}

export async function sendEventsEmail(
  journeyId: string,
  visitorId: string
): Promise<void> {
  if (process.env.NODE_ENV === 'test' || emailQueue == null) return
  const jobId = `visitor-event-${journeyId}-${visitorId}`
  const existingJob = await emailQueue.getJob(jobId)
  if (existingJob != null) {
    await emailQueue.remove(jobId)
  }
  await emailQueue.add(
    'visitor-event',
    { journeyId, visitorId },
    {
      jobId,
      delay: TWO_MINUTES,
      removeOnComplete: true,
      removeOnFail: { age: ONE_DAY, count: 50 }
    }
  )
}

export async function resetEventsEmailDelay(
  journeyId: string,
  visitorId: string,
  delaySeconds?: number
): Promise<void> {
  if (process.env.NODE_ENV === 'test' || emailQueue == null) return
  const jobId = `visitor-event-${journeyId}-${visitorId}`
  const existingJob = await emailQueue.getJob(jobId)
  if (existingJob == null) return
  const delayMs = Math.max((delaySeconds ?? 0) * 1000, TWO_MINUTES)
  await existingJob.changeDelay(delayMs)
}

// Live Google Sheets sync: append row per event when a sync config exists
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
    distinct: ['blockId', 'label']
  })

  // Normalize labels and deduplicate by normalized key
  const headerMap = new Map<string, { blockId: string; label: string }>()
  blockHeadersResult
    .filter((header) => header.blockId != null)
    .forEach((header) => {
      const normalizedLabel = (header.label ?? '').replace(/\s+/g, ' ').trim()
      const key = `${header.blockId}-${normalizedLabel}`
      // Only add if not already present (handles duplicates with different whitespace)
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

  let keyForRow = dynamicKey

  // Ensure the current event's block is included in the header calculation.
  // This handles the case where a new block is added to the journey and this
  // is the first event for that block - without this, the header wouldn't
  // include the new block's column and the data would be lost.
  if (dynamicKey !== '') {
    // Longest-prefix match to avoid prefix collisions (order-independent)
    // e.g., if we have block IDs "block-1" and "block-1-extended", we need
    // to match the longest one that fits
    const matchedBlock = journeyBlocks
      .filter((b) => dynamicKey === b.id || dynamicKey.startsWith(`${b.id}-`))
      .sort((a, b) => b.id.length - a.id.length)[0]

    if (matchedBlock != null) {
      // Check if there's already a header entry for this blockId
      // This fixes the issue where frontend sends a label like "Step 3" but the
      // correct column key should be based on existing data (e.g., "blockId-card 2")
      const existingKeyForBlock = Array.from(headerMap.keys()).find((k) =>
        k.startsWith(`${matchedBlock.id}-`)
      )

      if (existingKeyForBlock != null) {
        // Use the existing column key for this blockId to avoid creating duplicate columns
        keyForRow = existingKeyForBlock
      } else {
        // No existing column for this block - normalize and potentially add to headerMap
        const prefix = `${matchedBlock.id}-`
        const rawLabel = dynamicKey.startsWith(prefix)
          ? dynamicKey.substring(prefix.length)
          : ''
        // Normalize label to match how historical headers are normalized
        const normalizedLabel = rawLabel.replace(/\s+/g, ' ').trim()
        const normalizedKey = `${matchedBlock.id}-${normalizedLabel}`
        keyForRow = normalizedKey

        if (
          !headerMap.has(normalizedKey) &&
          connectedBlockIds.has(matchedBlock.id)
        ) {
          headerMap.set(normalizedKey, {
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
      if (keyForRow !== '' && dynamicValue !== '') {
        rowMap[keyForRow] = dynamicValue
      }

      const alignedRow = updatedFinalHeader.map((key) => rowMap[key] ?? '')
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
          // Both values exist: check if new value is already in existing (avoid duplicates)
          const existingParts = existingValue.split('; ').map((s) => s.trim())
          if (existingParts.includes(value.trim())) return existingValue
          // Append new value with semicolon separator (matching CSV export behavior)
          return `${existingValue}; ${value}`
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

  // Log errors for any failed syncs
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const sync = syncs[index]
      console.error(
        `Failed to sync event to Google Sheet (spreadsheetId: ${sync.spreadsheetId}, sheetName: ${sync.sheetName}):`,
        result.reason
      )
    }
  })
}
