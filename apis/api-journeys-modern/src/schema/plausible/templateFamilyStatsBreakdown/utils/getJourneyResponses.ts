import { prisma } from '@core/prisma/journeys/client'

import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

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
