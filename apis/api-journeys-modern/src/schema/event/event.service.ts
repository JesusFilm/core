import { GraphQLError } from 'graphql'

import {
  Block,
  JourneyVisitor,
  Visitor
} from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'

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
      ? await prisma.block.findUnique({
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
