import { prisma } from '@core/prisma/journeys/client'

import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

/**
 * Gets the count of text responses for each journey.
 * Only counts journey visitors that have submitted a text response (lastTextResponse is not null).
 *
 * @param journeys - Array of journeys to get response counts for
 * @returns Array of journey IDs with response counts. Returns an empty array if journeys is empty or if no journeys have responses.
 */
export async function getJourneysResponses(
  journeys: JourneyWithAcl[]
): Promise<{ journeyId: string; visitors: number }[]> {
  if (journeys.length === 0) {
    return []
  }

  const journeyIds = journeys.map((journey) => journey.id)

  const results = await prisma.journeyVisitor.groupBy({
    by: ['journeyId'],
    where: {
      journeyId: { in: journeyIds },
      lastTextResponse: { not: null }
    },
    _count: {
      journeyId: true
    }
  })

  return results.map((result) => ({
    journeyId: result.journeyId,
    visitors: result._count.journeyId
  }))
}
