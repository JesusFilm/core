/**
 * Extracts unique template IDs from an array of journeys.
 * Filters out null/undefined values and deduplicates the results.
 *
 * @param journeys - Array of journey objects that may have a fromTemplateId property
 * @returns Array of unique template IDs
 */
export function extractTemplateIdsFromJourneys(
  journeys: Array<{ fromTemplateId?: string | null } | null> | null
): string[] {
  if (journeys == null) return []
  return Array.from(
    new Set(
      journeys
        .filter((journey) => journey?.fromTemplateId != null)
        .map((journey) => journey!.fromTemplateId!)
    )
  )
}
