import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

import { logger } from '../logger'

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

// Queue for Google Sheets sync
let googleSheetsSyncQueue: any
try {
  // Avoid requiring Redis in tests
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
export function __setEmailQueueForTests(mockQueue: any): void {
  emailQueue = mockQueue
}

// Test helper to inject a mock Google Sheets sync queue
// eslint-disable-next-line @typescript-eslint/naming-convention
export function __setGoogleSheetsSyncQueueForTests(mockQueue: any): void {
  googleSheetsSyncQueue = mockQueue
}

const TWO_MINUTES = 2 * 60 * 1000
export const ONE_DAY = 24 * 60 * 60 // in seconds
const ONE_HOUR = 60 * 60 // in seconds

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

/**
 * Queue backfill jobs to sync events to Google Sheets.
 * Schedules backfill jobs to run at the top of each minute (:00 seconds).
 * Multiple events throughout the minute (seconds 1-59) will batch into a single
 * backfill job via deterministic job IDs (backfill-${syncId}).
 *
 * This approach:
 * - Reduces API calls: backfill makes only 1 read request vs 3-4 for append
 * - Prevents quota errors: batches events over a full minute before syncing
 * - Uses BullMQ's automatic deduplication via deterministic job IDs
 * - Ensures predictable sync timing: all sheets sync at :00 each minute
 *
 * Jobs are configured with:
 * - Delay to next minute boundary (:00 seconds)
 * - Deterministic job IDs to prevent duplicates
 * - 3 retry attempts on failure
 * - Immediate expiration on success (removeOnComplete: true)
 * - 1 hour expiration on failure (removeOnFail: { age: ONE_HOUR })
 *
 * Note: No job is created if there are no active syncs for the journey.
 * Syncs without integrationId or sheetName are skipped with a warning.
 */
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
  if (process.env.NODE_ENV === 'test' || googleSheetsSyncQueue == null) return

  // Fetch syncs with integrationId needed for backfill jobs
  const syncs = await prisma.googleSheetsSync.findMany({
    where: { journeyId, teamId, deletedAt: null },
    select: {
      id: true,
      spreadsheetId: true,
      sheetName: true,
      timezone: true,
      integrationId: true
    }
  })

  // No syncs configured - skip job creation
  if (syncs.length === 0) return

  // Calculate target timestamp for next minute boundary (:00 seconds) once
  // All jobs will target this exact timestamp for consistent batching
  const now = new Date()
  const nextMinuteBoundary = new Date(now)
  nextMinuteBoundary.setSeconds(0)
  nextMinuteBoundary.setMilliseconds(0)
  nextMinuteBoundary.setMinutes(nextMinuteBoundary.getMinutes() + 1)
  const targetTimestamp = nextMinuteBoundary.getTime()

  // Queue backfill jobs instead of append jobs
  // Use deterministic job IDs to prevent duplicates - BullMQ handles deduplication automatically
  // Multiple events will batch into a single backfill job per sync
  for (const sync of syncs) {
    // Skip syncs without required fields for backfill
    if (sync.integrationId == null) {
      logger.warn(
        { syncId: sync.id, journeyId, teamId },
        'Skipping Google Sheets sync: missing integrationId'
      )
      continue
    }

    if (sync.sheetName == null) {
      logger.warn(
        { syncId: sync.id, journeyId, teamId },
        'Skipping Google Sheets sync: missing sheetName'
      )
      continue
    }

    // Calculate delay to target timestamp right before adding
    // This accounts for any time spent in the loop (await calls, etc.)
    // Ensures all jobs target the exact same minute boundary
    const delayMs = targetTimestamp - Date.now()

    // BullMQ silently ignores duplicate job IDs - no error thrown
    // If a job with this ID already exists, it will be ignored and not added
    await googleSheetsSyncQueue.add(
      'google-sheets-sync-backfill',
      {
        type: 'backfill',
        journeyId,
        teamId,
        syncId: sync.id,
        spreadsheetId: sync.spreadsheetId,
        sheetName: sync.sheetName,
        timezone: sync.timezone ?? 'UTC',
        integrationId: sync.integrationId
      },
      {
        jobId: `backfill-${sync.id}`,
        delay: delayMs,
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
}
