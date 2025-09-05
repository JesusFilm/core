import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

export async function fetchJourneyWithAclIncludes(journeyId: string) {
  const journey = await prisma.journey.findUnique({
    where: { id: journeyId },
    include: {
      userJourneys: true,
      team: {
        include: { userTeams: true }
      }
    }
  })
  if (!journey) {
    throw new GraphQLError('journey not found', {
      extensions: { code: 'NOT_FOUND' }
    })
  }
  return journey
}
