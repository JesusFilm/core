import { PlausibleStatsResponse } from '../../plausible'
import { JourneyWithAcl } from '../templateFamilyStatsBreakdown.query'

/**
 * Filters page visitors from Plausible stats and aggregates them by journey ID.
 * Properties are in the format "/journeyId/stepId" - extracts journeyId and matches to journey IDs.
 * Uses Math.max to get the maximum visitors per journey (not sum) to avoid double-counting
 * when the same visitor appears in multiple step pages. This matches the logic used in
 * templateFamilyStatsAggregate.
 *
 * @param pageVisitors - Array of Plausible stats responses with page properties
 * @param journeys - Array of journeys to match against page properties
 * @returns Array of journey IDs with maximum visitor counts per journey. Returns an empty array if no matches are found.
 */
export function filterPageVisitors(
  pageVisitors: PlausibleStatsResponse[],
  journeys: JourneyWithAcl[]
): { journeyId: string; visitors: number }[] {
  const journeyIdSet = new Set<string>()
  for (const journey of journeys) {
    journeyIdSet.add(journey.id)
  }

  const journeyVisitorsMap = new Map<string, number>()

  for (const pageVisitor of pageVisitors) {
    const property = pageVisitor.property ?? ''

    // Extract journeyId using the same logic as templateFamilyStatsAggregate
    // Properties are in format "/journeyId/stepId" - extract journeyId (between first and second slash)
    if (property.startsWith('/')) {
      const afterFirstSlash = property.slice(1)
      const nextSlashIndex = afterFirstSlash.indexOf('/')
      const journeyId =
        nextSlashIndex === -1
          ? afterFirstSlash
          : afterFirstSlash.slice(0, nextSlashIndex)
      if (!journeyId) {
        continue
      }

      if (journeyIdSet.has(journeyId)) {
        const visitors = pageVisitor.visitors ?? 0
        const currentMax = journeyVisitorsMap.get(journeyId) ?? 0
        const newMax = Math.max(currentMax, visitors)
        journeyVisitorsMap.set(journeyId, newMax)
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
