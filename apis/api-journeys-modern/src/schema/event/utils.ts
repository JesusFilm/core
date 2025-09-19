import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Visitor,
  prisma
} from '@core/prisma/journeys/client'

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
  const block = await prisma.block.findFirst({
    where: { id: blockId, deletedAt: null }
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

  // Get or create journey visitor atomically to avoid race conditions
  const journeyVisitor = await prisma.journeyVisitor.upsert({
    where: {
      journeyId_visitorId: {
        journeyId,
        visitorId: visitor.id
      }
    },
    create: {
      journeyId,
      visitorId: visitor.id
    },
    update: {}
  })

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
  const context = await prisma.block.findFirst({
    where: { id: blockId, deletedAt: null },
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
