import type {
  GetCampaignStats_campaignStats_all_countries as CampaignCountryStat,
  GetCampaignStats_campaignStats as CampaignStats
} from './__generated__/GetCampaignStats'

export type { CampaignCountryStat, CampaignStats }

export const ALL_REGIONS = 'all'

export const RANKED_COUNTRY_LIMIT = 10

export interface CampaignStatsView {
  totalVisitors: number
  /** The top countries by visitors, highest first. */
  countries: CampaignCountryStat[]
}

function scopeForTab(stats: CampaignStats, tab: string) {
  return tab === ALL_REGIONS
    ? stats.all
    : stats.regions.find((region) => region.regionId === tab)
}

/** Every country the tab's scope has visitors from (the map reads all of them, not the top ten). */
export function countriesForTab(
  stats: CampaignStats,
  tab: string
): CampaignCountryStat[] {
  return scopeForTab(stats, tab)?.countries ?? []
}

/**
 * The numbers one tab shows: `all` is the whole campaign, any other id the
 * region's own sums; a region the sweep has not seen yet reads as no visits.
 */
export function statsForTab(
  stats: CampaignStats,
  tab: string
): CampaignStatsView {
  const countries = [...countriesForTab(stats, tab)]
    .sort((a, b) => b.visitors - a.visitors)
    .slice(0, RANKED_COUNTRY_LIMIT)
  return {
    totalVisitors: scopeForTab(stats, tab)?.totalVisitors ?? 0,
    countries
  }
}

/**
 * A country's name in the viewer's locale. Plausible reports codes that are
 * not valid regions (`A1`) and `Intl.DisplayNames` throws on them, so the
 * code itself is the label.
 */
export function countryName(code: string, locale: string): string {
  try {
    return new Intl.DisplayNames([locale], { type: 'region' }).of(code) ?? code
  } catch {
    return code
  }
}

/** "Nov 1" (the locale's order), with the year once it is not the current one. */
export function formatSince(from: string, locale: string, now: Date): string {
  const date = new Date(from)
  const options: Intl.DateTimeFormatOptions = {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
    ...(date.getUTCFullYear() === now.getUTCFullYear()
      ? {}
      : { year: 'numeric' })
  }
  try {
    return new Intl.DateTimeFormat(locale, options).format(date)
  } catch {
    return new Intl.DateTimeFormat('en', options).format(date)
  }
}
