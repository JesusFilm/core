import { PlausibleStatsResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

/**
 * Filters page visitors from Plausible stats and aggregates them by journey ID.
 * Only processes properties with exactly one slash (first-level pages like "/journey-slug")
 * and matches them to journey slugs. Aggregates visitor counts for each matching journey.
 *
 * @param pageVisitors - Array of Plausible stats responses with page properties
 * @param journeys - Array of journeys to match against page properties
 * @returns Array of journey IDs with aggregated visitor counts. Returns an empty array if no matches are found.
 */
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
