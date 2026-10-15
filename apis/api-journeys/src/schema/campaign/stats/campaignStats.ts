import { prisma } from '@core/prisma/journeys/client'

import { logger as parentLogger } from '../../logger'
import { getJourneyStatsBreakdown } from '../../plausible/service'

import {
  CachedCampaignStatsSweep,
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
// At most this many journeys are in flight against Plausible at once, so a
// large campaign cannot burst through the shared per-key rate limit.
const SWEEP_CONCURRENCY = 5
// With nothing cached the request has to wait for the sweep; past this it gives
// up and leaves the sweep running to fill the cache for the next reader.
const COLD_SWEEP_DEADLINE_MS = PUBLIC_STATS_TIMEOUT_MS
const UNAVAILABLE_MESSAGE = 'Campaign stats are temporarily unavailable'

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
  return rows.map(({ property, visitors }) => ({
    countryCode: (property ?? '').trim().toUpperCase(),
    visitors:
      typeof visitors === 'number' && Number.isFinite(visitors) ? visitors : 0
  }))
}

/** `Promise.allSettled` over `items`, running `worker` on at most `limit` of them at a time. */
async function settleWithConcurrency<Item, Result>(
  items: Item[],
  limit: number,
  worker: (item: Item) => Promise<Result>
): Promise<Array<PromiseSettledResult<Result>>> {
  const results: Array<PromiseSettledResult<Result>> = new Array(items.length)
  let next = 0
  async function drain(): Promise<void> {
    while (next < items.length) {
      const index = next++
      try {
        results[index] = {
          status: 'fulfilled',
          value: await worker(items[index])
        }
      } catch (reason) {
        results[index] = { status: 'rejected', reason }
      }
    }
  }
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, drain)
  )
  return results
}

/**
 * One `visit:country` breakdown (visitors only) per distinct linked journey, on
 * that journey's own site, from the Campaign's first publish (creation for a
 * draft) to now, a few journeys at a time. A journey whose request fails keeps
 * its rows from `previous` (the last sweep over the same window), else counts
 * as no visitors, so one bad site cannot sink the rest; `partial` reports that
 * some failed. Throws only when every journey failed.
 */
async function sweepCampaign(
  campaign: CampaignStatsSubject,
  now: Date,
  previous: CampaignStatsSweep | null
): Promise<{ sweep: CampaignStatsSweep; partial: boolean }> {
  const start = campaign.publishedAt ?? campaign.createdAt
  const from = start.getTime() > now.getTime() ? now : start
  const journeyIds = linkedJourneyIds(
    campaign.regions.flatMap((region) => region.languages)
  )
  const settled = await settleWithConcurrency(
    journeyIds,
    SWEEP_CONCURRENCY,
    async (journeyId) => await sweepJourney(journeyId, from, now)
  )
  const failures = settled.flatMap((result, index) =>
    result.status === 'rejected'
      ? [{ journeyId: journeyIds[index], reason: result.reason }]
      : []
  )
  if (failures.length > 0 && failures.length === journeyIds.length)
    throw failures[0].reason
  if (failures.length > 0)
    logger.warn(
      {
        campaignId: campaign.id,
        failedJourneyIds: failures.map(({ journeyId }) => journeyId),
        error: failures[0].reason
      },
      'stats sweep kept partial results'
    )
  const fromIso = from.toISOString()
  const reusable = previous?.from === fromIso ? previous.journeys : {}
  return {
    sweep: {
      from: fromIso,
      to: now.toISOString(),
      journeys: Object.fromEntries(
        journeyIds.map((journeyId, index) => {
          const result = settled[index]
          return [
            journeyId,
            result.status === 'fulfilled'
              ? result.value
              : (reusable[journeyId] ?? [])
          ]
        })
      )
    },
    partial: failures.length > 0
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

/** `promise`, or a rejection once `ms` pass; the promise itself is left running. */
async function withDeadline<Value>(
  promise: Promise<Value>,
  ms: number
): Promise<Value> {
  let timer: NodeJS.Timeout | undefined
  const deadline = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => reject(new Error(UNAVAILABLE_MESSAGE)), ms)
  })
  try {
    return await Promise.race([promise, deadline])
  } finally {
    clearTimeout(timer)
  }
}

/**
 * Sweep and cache, sharing one in-flight sweep per campaign so concurrent
 * callers cost one round of requests. A failed sweep defers the next refresh
 * (keeping whatever `cached` holds) before it rethrows.
 */
async function refreshSweep(
  campaign: CampaignStatsSubject,
  cached: CachedCampaignStatsSweep | null
): Promise<CampaignStatsSweep> {
  const inFlight = refreshes.get(campaign.id)
  if (inFlight != null) return await inFlight
  const refresh = (async () => {
    try {
      const { sweep, partial } = await sweepCampaign(
        campaign,
        new Date(),
        cached?.sweep ?? null
      )
      await statsCache.set(campaign.id, sweep, { partial })
      return sweep
    } catch (error) {
      logger.error({ error, campaignId: campaign.id }, 'stats sweep failed')
      await statsCache.deferRefresh(campaign.id, cached)
      throw error
    }
  })().finally(() => refreshes.delete(campaign.id))
  refreshes.set(campaign.id, refresh)
  return await refresh
}

/**
 * The campaign restricted to journeys that still exist: draft, published and
 * archived all count, trashed and deleted ones do not. Read live, so a journey
 * that is trashed drops out and counts again once it is restored.
 */
async function withExistingJourneys(
  campaign: CampaignStatsSubject
): Promise<CampaignStatsSubject> {
  const linkedIds = linkedJourneyIds(
    campaign.regions.flatMap((region) => region.languages)
  )
  if (linkedIds.length === 0) return campaign
  const existing = await prisma.journey.findMany({
    where: {
      id: { in: linkedIds },
      deletedAt: null,
      status: { notIn: ['trashed', 'deleted'] }
    },
    select: { id: true }
  })
  const existingIds = new Set(existing.map(({ id }) => id))
  return {
    ...campaign,
    regions: campaign.regions.map((region) => ({
      id: region.id,
      languages: region.languages.filter(
        ({ journeyId }) => journeyId != null && existingIds.has(journeyId)
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
 * The Campaign's visitor stats from its cached sweep. A cached sweep is always
 * served as it is, however old: when it is stale or no longer matches the
 * campaign (a journey linked or restored since the sweep) a refresh runs in the
 * background for the next reader, so the request never waits on Plausible. Only
 * with nothing cached does the request sweep and wait, for at most
 * `COLD_SWEEP_DEADLINE_MS` (the sweep carries on and fills the cache for the
 * next reader); if the sweep fails the failure propagates and a marker is
 * cached, so requests in the next few minutes fail fast instead of sweeping
 * again. A sweep that kept partial results is served, and the journeys that
 * failed are retried after the backoff. A failed refresh is not retried
 * for a few minutes; the first request after that retries it.
 */
export async function getCampaignStats(
  campaignWithAllJourneys: CampaignStatsSubject
): Promise<CampaignStats> {
  const campaign = await withExistingJourneys(campaignWithAllJourneys)
  const cached = await statsCache.get(campaign.id)
  if (cached?.sweep == null) {
    if (cached?.backingOff === true) throw new Error(UNAVAILABLE_MESSAGE)
    return sumCampaignStats(
      campaign,
      await withDeadline(refreshSweep(campaign, cached), COLD_SWEEP_DEADLINE_MS)
    )
  }

  const current = cached.fresh && sweepMatchesCampaign(campaign, cached.sweep)
  if (!current && !cached.backingOff)
    refreshSweep(campaign, cached).catch(() => {
      // refreshSweep has already logged the failure and deferred the retry.
    })
  return sumCampaignStats(campaign, cached.sweep)
}
