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

  return { visitor, journeyVisitor, journeyId, block }
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
  // find sync config
  const sync = await prisma.googleSheetsSync.findFirst({
    where: { journeyId, teamId, deletedAt: null }
  })
  if (sync == null) return

  const { accessToken } = await getTeamGoogleAccessToken(teamId)
  const tabName =
    sheetName ?? sync.sheetName ?? `${format(new Date(), 'yyyy-MM-dd')}`
  await ensureSheet({
    accessToken,
    spreadsheetId: sync.spreadsheetId,
    sheetTitle: tabName
  })
  // Expected incoming row format from callers:
  // [visitorId, createdAtISO, name, email, phone, dynamicKey, dynamicValue]
  const safe = (v: string | number | null | undefined): string =>
    v == null ? '' : String(v)
  const visitorId = safe(row[0])
  const createdAt = safe(row[1])
  const name = safe(row[2])
  const email = safe(row[3])
  const phone = safe(row[4])
  const dynamicKey = safe(row[5])
  const dynamicValue = safe(row[6])

  // Load current header
  const headerRange = `${tabName}!A1:ZZ1`
  const headerRows = await readValues({
    accessToken,
    spreadsheetId: sync.spreadsheetId,
    range: headerRange
  })
  const existingHeader: string[] = (headerRows[0] ?? []).map((v) => v ?? '')

  // Ensure base headers
  const baseHeaders = ['visitorId', 'createdAt', 'name', 'email', 'phone']
  let headers: string[] = existingHeader.length > 0 ? [...existingHeader] : []
  if (headers.length === 0) headers = [...baseHeaders]

  // Ensure base headers are present (prepend if missing)
  for (let i = 0; i < baseHeaders.length; i++) {
    if (!headers.includes(baseHeaders[i])) headers.splice(i, 0, baseHeaders[i])
  }
  // Ensure dynamic key column exists (if provided)
  if (dynamicKey !== '' && !headers.includes(dynamicKey)) {
    headers.push(dynamicKey)
  }

  // If headers changed, write them back
  const headersChanged =
    existingHeader.length === 0 ||
    headers.length !== existingHeader.length ||
    headers.some((h, i) => h !== (existingHeader[i] ?? ''))
  if (headersChanged) {
    await updateRangeValues({
      accessToken,
      spreadsheetId: sync.spreadsheetId,
      range: `${tabName}!A1:${columnIndexToA1(headers.length - 1)}1`,
      values: [headers]
    })
  }

  // Build an aligned row matching headers
  const alignedRow = new Array(headers.length).fill('') as string[]
  const setIfPresent = (key: string, value: string) => {
    const idx = headers.indexOf(key)
    if (idx >= 0 && value !== '') alignedRow[idx] = value
  }
  setIfPresent('visitorId', visitorId)
  setIfPresent('createdAt', createdAt)
  setIfPresent('name', name)
  setIfPresent('email', email)
  setIfPresent('phone', phone)
  if (dynamicKey !== '') setIfPresent(dynamicKey, dynamicValue)

  // Try to find an existing row for this visitorId in column A (which should be visitorId)
  const idColumnRange = `${tabName}!A2:A1000000`
  const idColumnValues = await readValues({
    accessToken,
    spreadsheetId: sync.spreadsheetId,
    range: idColumnRange
  })
  let foundRowIndex: number | null = null // 1-based row index in the sheet
  for (let i = 0; i < idColumnValues.length; i++) {
    const cellVal = idColumnValues[i]?.[0] ?? ''
    if (cellVal === visitorId && visitorId !== '') {
      foundRowIndex = i + 2 // offset since A2 is index 0
      break
    }
  }

  const lastColA1 = columnIndexToA1(headers.length - 1)
  if (foundRowIndex != null) {
    // Read existing row to merge values (avoid blanking non-updated fields)
    const existingRowRes = await readValues({
      accessToken,
      spreadsheetId: sync.spreadsheetId,
      range: `${tabName}!A${foundRowIndex}:${lastColA1}${foundRowIndex}`
    })
    const existingRow: string[] = (existingRowRes[0] ?? []).map((v) => v ?? '')
    const mergedRow = new Array(headers.length)
      .fill('')
      .map((_, i) =>
        alignedRow[i] !== '' ? alignedRow[i] : (existingRow[i] ?? '')
      )

    await updateRangeValues({
      accessToken,
      spreadsheetId: sync.spreadsheetId,
      range: `${tabName}!A${foundRowIndex}:${lastColA1}${foundRowIndex}`,
      values: [mergedRow]
    })
  } else {
    // Append as a new row
    await writeValues({
      accessToken,
      spreadsheetId: sync.spreadsheetId,
      sheetTitle: tabName,
      values: [alignedRow],
      append: true
    })
  }
}
