import { GraphQLError } from 'graphql'

import { prisma } from '../../lib/prisma'

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
