import { prisma } from '@core/prisma/journeys/client'

import { logger as parentLogger } from '../../logger'
import { getJourneyStatsBreakdown } from '../../plausible/service'

import {
  CampaignJourneyCountryRow,
  CampaignStatsSweep,
  statsCache
} from './statsCache'

const logger = parentLogger.child({ module: 'campaignStats' })

// Anonymous visitors must not pin on a hung Plausible connection for the
// service default of 30s.
const PUBLIC_STATS_TIMEOUT_MS = 10000
// There are fewer than 250 ISO country codes; one page covers every row.
const COUNTRY_ROW_LIMIT = 300

export interface CampaignCountryStat {
  countryCode: string
  visitors: number
}

export interface CampaignStatsScope {
  totalVisitors: number
  countries: CampaignCountryStat[]
}

export interface CampaignRegionStats extends CampaignStatsScope {
  regionId: string
}

export interface CampaignStats {
  from: Date
  to: Date
  all: CampaignStatsScope
  regions: CampaignRegionStats[]
}

/** The part of a Campaign the stats read: its dates and its region → language → journey structure. */
export interface CampaignStatsSubject {
  id: string
  publishedAt: Date | null
  createdAt: Date
  regions: Array<{
    id: string
    languages: Array<{ journeyId: string | null }>
  }>
}

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10)
}

function linkedJourneyIds(
  languages: Array<{ journeyId: string | null }>
): string[] {
  const journeyIds = new Set<string>()
  for (const { journeyId } of languages)
    if (journeyId != null) journeyIds.add(journeyId)
  return [...journeyIds]
}

async function sweepJourney(
  journeyId: string,
  from: Date,
  to: Date
): Promise<CampaignJourneyCountryRow[]> {
  const rows = await getJourneyStatsBreakdown(
    journeyId,
    {
      property: 'visit:country',
      metrics: 'visitors',
      period: 'custom',
      date: `${toDateString(from)},${toDateString(to)}`,
      limit: COUNTRY_ROW_LIMIT
    },
    undefined,
    { timeoutMs: PUBLIC_STATS_TIMEOUT_MS }
  )
  return rows.map((row) => {
    const visitors = (row as unknown as Record<string, unknown>).visitors
    return {
      countryCode: (row.property ?? '').trim().toUpperCase(),
      visitors:
        typeof visitors === 'number' && Number.isFinite(visitors) ? visitors : 0
    }
  })
}

/**
 * One `visit:country` breakdown (visitors only) per distinct linked journey, on
 * that journey's own site, from the Campaign's first publish (creation for a
 * draft) to now. Fails whole if any journey fails, so a partial sweep is never
 * cached.
 */
async function sweepCampaign(
  campaign: CampaignStatsSubject,
  now: Date
): Promise<CampaignStatsSweep> {
  const start = campaign.publishedAt ?? campaign.createdAt
  const from = start.getTime() > now.getTime() ? now : start
  const journeyIds = linkedJourneyIds(
    campaign.regions.flatMap((region) => region.languages)
  )
  const rows = await Promise.all(
    journeyIds.map(
      async (journeyId) => await sweepJourney(journeyId, from, now)
    )
  )
  return {
    from: from.toISOString(),
    to: now.toISOString(),
    journeys: Object.fromEntries(
      journeyIds.map((journeyId, index) => [journeyId, rows[index]])
    )
  }
}

function sumScope(
  journeyIds: string[],
  sweep: CampaignStatsSweep
): CampaignStatsScope {
  let totalVisitors = 0
  const visitorsByCountry = new Map<string, number>()
  for (const journeyId of journeyIds) {
    for (const { countryCode, visitors } of sweep.journeys[journeyId] ?? []) {
      totalVisitors += visitors
      // Unknown-country rows count in the total but cannot be listed.
      if (countryCode === '') continue
      visitorsByCountry.set(
        countryCode,
        (visitorsByCountry.get(countryCode) ?? 0) + visitors
      )
    }
  }
  const countries = [...visitorsByCountry]
    .map(([countryCode, visitors]) => ({ countryCode, visitors }))
    .sort(
      (a, b) =>
        b.visitors - a.visitors || a.countryCode.localeCompare(b.countryCode)
    )
  return { totalVisitors, countries }
}

/**
 * Sum a sweep's per-journey rows through the Campaign's own structure: a region
 * is the sum of its distinct linked journeys, the landing scope the sum of
 * every distinct linked journey. A journey linked by two regions counts once
 * in each region and once overall; a visitor who opens two journeys counts in
 * both.
 */
export function sumCampaignStats(
  campaign: CampaignStatsSubject,
  sweep: CampaignStatsSweep
): CampaignStats {
  return {
    from: new Date(sweep.from),
    to: new Date(sweep.to),
    all: sumScope(
      linkedJourneyIds(campaign.regions.flatMap((region) => region.languages)),
      sweep
    ),
    regions: campaign.regions.map((region) => ({
      regionId: region.id,
      ...sumScope(linkedJourneyIds(region.languages), sweep)
    }))
  }
}

const refreshes = new Map<string, Promise<CampaignStatsSweep>>()

/** Sweep and cache, sharing one in-flight sweep per campaign so concurrent callers cost one round of requests. */
async function refreshSweep(
  campaign: CampaignStatsSubject
): Promise<CampaignStatsSweep> {
  const inFlight = refreshes.get(campaign.id)
  if (inFlight != null) return await inFlight
  const refresh = (async () => {
    const sweep = await sweepCampaign(campaign, new Date())
    await statsCache.set(campaign.id, sweep)
    return sweep
  })().finally(() => refreshes.delete(campaign.id))
  refreshes.set(campaign.id, refresh)
  return await refresh
}

/**
 * The campaign restricted to journeys visitors can reach right now: published
 * or archived, never draft, trashed or deleted. Read live, so a journey that is
 * unpublished drops out and counts again once it is published.
 */
async function withVisibleJourneys(
  campaign: CampaignStatsSubject
): Promise<CampaignStatsSubject> {
  const linkedIds = linkedJourneyIds(
    campaign.regions.flatMap((region) => region.languages)
  )
  if (linkedIds.length === 0) return campaign
  const visible = await prisma.journey.findMany({
    where: {
      id: { in: linkedIds },
      deletedAt: null,
      status: { in: ['published', 'archived'] }
    },
    select: { id: true }
  })
  const visibleIds = new Set(visible.map(({ id }) => id))
  return {
    ...campaign,
    regions: campaign.regions.map((region) => ({
      id: region.id,
      languages: region.languages.filter(
        ({ journeyId }) => journeyId != null && visibleIds.has(journeyId)
      )
    }))
  }
}

/** Whether a cached sweep still describes this campaign: same window start and a row set for every counted journey. */
function sweepMatchesCampaign(
  campaign: CampaignStatsSubject,
  sweep: CampaignStatsSweep
): boolean {
  const start = campaign.publishedAt ?? campaign.createdAt
  const expectedFrom =
    start.getTime() > new Date(sweep.to).getTime()
      ? sweep.to
      : start.toISOString()
  if (sweep.from !== expectedFrom) return false
  return linkedJourneyIds(
    campaign.regions.flatMap((region) => region.languages)
  ).every((journeyId) => sweep.journeys[journeyId] != null)
}

/**
 * The Campaign's visitor stats from its cached sweep, sweeping Plausible on a
 * miss, once the entry is stale, or when the entry no longer matches the
 * campaign (a journey linked or published since the sweep). When a sweep fails,
 * the last cached sweep is served and not retried for a few minutes; with
 * nothing cached the failure propagates.
 */
export async function getCampaignStats(
  campaignWithAllJourneys: CampaignStatsSubject
): Promise<CampaignStats> {
  const campaign = await withVisibleJourneys(campaignWithAllJourneys)
  const cached = await statsCache.get(campaign.id)
  if (cached != null) {
    const servable =
      cached.backingOff ||
      (cached.fresh && sweepMatchesCampaign(campaign, cached.sweep))
    if (servable) return sumCampaignStats(campaign, cached.sweep)
  }

  try {
    return sumCampaignStats(campaign, await refreshSweep(campaign))
  } catch (error) {
    if (cached == null) throw error
    logger.error({ error, campaignId: campaign.id }, 'stats sweep failed')
    await statsCache.deferRefresh(campaign.id, cached)
    return sumCampaignStats(campaign, cached.sweep)
  }
}
