import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

export async function fetchBlockWithJourneyAcl(blockId: string) {
  const block = await prisma.block.findFirst({
    where: { id: blockId, deletedAt: null },
    include: {
      action: true,
      journey: {
        include: {
          userJourneys: true,
          team: {
            include: { userTeams: true }
          }
        }
      }
    }
  })
  if (!block) {
    throw new GraphQLError('block not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  return block
}
