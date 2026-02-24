import { prisma } from '@core/prisma/journeys/client'

import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

/**
 * Gets the count of text responses for each journey.
 * Only counts journey visitors that have submitted a text response (lastTextResponse is not null).
 *
 * @param journeysOrIds - Array of journeys or journey IDs to get response counts for
 * @returns Array of journey IDs with response counts. Returns an empty array if input is empty or if no journeys have responses.
 */
export async function getJourneysResponses(
  journeysOrIds: JourneyWithAcl[] | string[]
): Promise<{ journeyId: string; visitors: number }[]> {
  if (journeysOrIds.length === 0) {
    return []
  }

  const journeyIds =
    typeof journeysOrIds[0] === 'string'
      ? (journeysOrIds as string[])
      : (journeysOrIds as JourneyWithAcl[]).map((journey) => journey.id)

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
