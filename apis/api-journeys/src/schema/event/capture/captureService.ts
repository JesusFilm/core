import { GraphQLError } from 'graphql'
import { validate as validateUuid } from 'uuid'

import { Event, Prisma, prisma } from '@core/prisma/journeys/client'

import { getByUserIdAndJourneyId } from '../eventService'

import {
  CAPTURE_EVENTS,
  CaptureEventInput,
  CaptureEventTypename
} from './captureTypes'

/** Reject a capture whose block, tag, trigger or containing Step is invalid. */
function invalidContext(): never {
  throw new GraphQLError(
    'Capture does not match the current block, tag or step',
    {
      extensions: { code: 'BAD_USER_INPUT' }
    }
  )
}

/**
 * Return the saved snapshot for a matching retry, or null for a new occurrence.
 * Reject reuse of an occurrence ID by another visitor or capture context.
 */
async function existingOccurrence(
  userId: string,
  typename: CaptureEventTypename,
  input: CaptureEventInput
): Promise<Event | null> {
  const existing = await prisma.event.findUnique({
    where: { id: input.id },
    include: { visitor: true }
  })
  if (existing == null) return null

  if (
    existing.visitor.userId !== userId ||
    existing.typename !== typename ||
    existing.blockId !== input.blockId ||
    existing.stepId !== input.stepId ||
    existing.captureTrigger !== input.trigger
  ) {
    throw new GraphQLError(
      'Occurrence ID already belongs to a different event',
      {
        extensions: { code: 'CONFLICT' }
      }
    )
  }
  return existing
}

/**
 * Validate the played journey context and persist an explicit capture occurrence.
 * Resolve visitor and family attribution server-side. Matching retries, including
 * concurrent deliveries, return the original snapshot without adding activity.
 */
export async function createCaptureEvent(
  userId: string,
  typename: CaptureEventTypename,
  input: CaptureEventInput
): Promise<Event> {
  if (!validateUuid(input.id)) {
    throw new GraphQLError('Capture ID must be an occurrence UUID', {
      extensions: { code: 'BAD_USER_INPUT' }
    })
  }

  // Retries return the original snapshot even if the author has since edited it.
  const existing = await existingOccurrence(userId, typename, input)
  if (existing != null) return existing

  const block = await prisma.block.findFirst({
    where: { id: input.blockId, deletedAt: null }
  })
  if (block == null) invalidContext()

  const capture = CAPTURE_EVENTS[typename]
  const allowedTrigger = {
    CardBlock: ['stepView'],
    ButtonBlock: ['buttonClick'],
    RadioOptionBlock: ['radioQuestionSubmit'],
    VideoBlock: ['videoStart', 'videoComplete']
  } as const
  const triggers: readonly string[] =
    allowedTrigger[block.typename as keyof typeof allowedTrigger] ?? []
  const tag =
    input.trigger === 'videoComplete' ? block.endEventLabel : block.eventLabel
  if (!triggers.includes(input.trigger) || tag !== capture.tag) invalidContext()

  const journey = await prisma.journey.findFirst({
    where: { id: block.journeyId, deletedAt: null }
  })
  if (journey == null) invalidContext()

  const step = await prisma.block.findFirst({
    where: {
      id: input.stepId,
      journeyId: journey.id,
      typename: 'StepBlock',
      deletedAt: null
    }
  })
  if (step == null) invalidContext()
  if (block.typename === 'CardBlock' && block.parentBlockId !== step.id)
    invalidContext()
  if (block.typename === 'RadioOptionBlock') {
    const question = await prisma.block.findFirst({
      where: {
        id: block.parentBlockId ?? '',
        journeyId: journey.id,
        typename: 'RadioQuestionBlock',
        deletedAt: null
      }
    })
    if (question == null) invalidContext()
  }

  // Walk the played journey's actual ancestry, including covers and nested grids.
  const visited = new Set([block.id])
  let parentId = block.parentBlockId
  while (parentId !== step.id) {
    if (parentId == null || visited.has(parentId)) invalidContext()
    visited.add(parentId)
    const parent = await prisma.block.findFirst({
      where: { id: parentId, journeyId: journey.id, deletedAt: null }
    })
    if (parent == null || parent.typename === 'StepBlock') invalidContext()
    parentId = parent.parentBlockId
  }

  const { visitor } = await getByUserIdAndJourneyId(
    userId,
    journey.id,
    journey.teamId
  )
  try {
    return await prisma.event.create({
      data: {
        id: input.id,
        typename,
        blockId: block.id,
        stepId: step.id,
        captureIdentity: capture.identity,
        captureTag: capture.tag,
        captureTrigger: input.trigger,
        templateFamilyId: journey.template
          ? journey.id
          : journey.fromTemplateId,
        visitor: { connect: { id: visitor.id } },
        journey: { connect: { id: journey.id } }
      }
    })
  } catch (error) {
    // Concurrent delivery can race the first read. The primary key chooses the winner.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      const saved = await existingOccurrence(userId, typename, input)
      if (saved != null) return saved
    }
    throw error
  }
}
