/**
 * An axios response for Plausible's `/api/v1/stats/breakdown?property=visit:country`
 * with `metrics=visitors`: one row per `[countryCode, visitors]` pair.
 */
export function plausibleCountryRows(
  rows: Array<[countryCode: string, visitors: number]>
): { data: { results: Array<{ country: string; visitors: number }> } } {
  return {
    data: {
      results: rows.map(([country, visitors]) => ({ country, visitors }))
    }
  }
}

/**
 * Answer each breakdown request from the rows of the journey site it names
 * (`site_id=api-journeys-journey-<journeyId>`), so a spec can give every linked
 * journey its own rows and count the requests made.
 */
export function plausibleCountryRowsBySite(
  rowsByJourneyId: Record<string, Array<[string, number]>>
): (
  url: string,
  config?: { params?: { site_id?: string } }
) => Promise<ReturnType<typeof plausibleCountryRows>> {
  return async (_url, config) => {
    const siteId = config?.params?.site_id ?? ''
    const journeyId = siteId.replace('api-journeys-journey-', '')
    return plausibleCountryRows(rowsByJourneyId[journeyId] ?? [])
  }
}
