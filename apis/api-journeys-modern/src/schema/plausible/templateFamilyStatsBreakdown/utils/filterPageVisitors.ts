import { PlausibleStatsResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

export function filterPageVisitors(
  pageVisitors: PlausibleStatsResponse[],
  journeys: JourneyWithAcl[]
): { journeyId: string; visitors: number }[] {
  const journeySlugMap = new Map<string, string>()
  for (const journey of journeys) {
    journeySlugMap.set(journey.slug, journey.id)
  }

  const journeyVisitorsMap = new Map<string, number>()

  for (const pageVisitor of pageVisitors) {
    const property = pageVisitor.property ?? ''

    const slashCount = (property.match(/\//g) ?? []).length

    if (slashCount > 1) {
      continue
    }

    if (slashCount === 1 && property.startsWith('/')) {
      const slug = property.slice(1)
      const journeyId = journeySlugMap.get(slug)

      if (journeyId != null) {
        const visitors = pageVisitor.visitors ?? 0
        journeyVisitorsMap.set(
          journeyId,
          (journeyVisitorsMap.get(journeyId) ?? 0) + visitors
        )
      }
    }
  }

  return Array.from(journeyVisitorsMap.entries()).map(
    ([journeyId, visitors]) => ({
      journeyId,
      visitors
    })
  )
}
