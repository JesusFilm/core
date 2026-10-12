import Redis from 'ioredis'

import { connection } from '../../../workers/lib/connection'
import { logger as parentLogger } from '../../logger'

const logger = parentLogger.child({ module: 'campaignStatsCache' })

export interface CampaignJourneyCountryRow {
  /** ISO alpha-2 as Plausible reports it, upper-cased; empty when the country is unknown. */
  countryCode: string
  visitors: number
}

/** One Plausible sweep of a Campaign: every linked journey's country rows over `from`..`to`. */
export interface CampaignStatsSweep {
  from: string
  to: string
  journeys: Record<string, CampaignJourneyCountryRow[]>
}

export interface CachedCampaignStatsSweep {
  /** Null for a failure marker: the first sweep failed, so there is nothing to serve. */
  sweep: CampaignStatsSweep | null
  /** When the sweep was taken, epoch ms. */
  sweptAt: number
  /** Within the TTL; a stale sweep is only served when a refresh fails. */
  fresh: boolean
  /** A refresh failed recently; serve this sweep without sweeping again until the backoff passes. */
  backingOff: boolean
}

export const STATS_CACHE_TTL_SECONDS = 30 * 60

// After a failed refresh the stale sweep is served without sweeping again for
// this long, so an outage or a rate-limited key is not hit on every page view.
export const STATS_REFRESH_BACKOFF_SECONDS = 5 * 60

// Redis keeps an entry long after it stops being fresh so the last sweep is
// still there to serve when Plausible is down.
const STATS_CACHE_RETENTION_SECONDS = 24 * 60 * 60

interface StatsCacheEntry {
  sweptAt: number
  /** Epoch ms before which a failed refresh is not retried. */
  retryAfter?: number
  sweep: CampaignStatsSweep | null
}

let client: Redis | undefined

function getClient(): Redis {
  if (client != null) return client
  client = new Redis({
    ...connection,
    connectTimeout: 5000,
    maxRetriesPerRequest: 2
  })
  client.on('error', (error) => {
    logger.error({ error }, 'redis connection error')
  })
  return client
}

function key(campaignId: string): string {
  return `campaign-stats:${campaignId}`
}

/**
 * The one cached sweep per Campaign, keyed by campaign id: a plain GET / SET EX
 * on one JSON string. A Redis failure reads as a miss and a failed write is
 * logged, so the cache can never fail the query.
 */
export const statsCache = {
  async get(campaignId: string): Promise<CachedCampaignStatsSweep | null> {
    try {
      const raw = await getClient().get(key(campaignId))
      if (raw == null) return null
      const entry = JSON.parse(raw) as StatsCacheEntry
      const now = Date.now()
      return {
        sweep: entry.sweep,
        sweptAt: entry.sweptAt,
        fresh:
          entry.sweep != null &&
          now - entry.sweptAt < STATS_CACHE_TTL_SECONDS * 1000,
        backingOff: entry.retryAfter != null && now < entry.retryAfter
      }
    } catch (error) {
      logger.error({ error, campaignId }, 'stats cache read failed')
      return null
    }
  },

  async set(campaignId: string, sweep: CampaignStatsSweep): Promise<void> {
    const entry: StatsCacheEntry = { sweptAt: Date.now(), sweep }
    try {
      await getClient().set(
        key(campaignId),
        JSON.stringify(entry),
        'EX',
        STATS_CACHE_RETENTION_SECONDS
      )
    } catch (error) {
      logger.error({ error, campaignId }, 'stats cache write failed')
    }
  },

  /**
   * Record a failed refresh: the entry keeps its sweep, `sweptAt` and original
   * retention, but is not retried until the backoff passes. With nothing cached
   * (`cached` is null) a sweepless failure marker is written for the backoff
   * alone, so a campaign whose first sweep fails is not swept on every request.
   */
  async deferRefresh(
    campaignId: string,
    cached: CachedCampaignStatsSweep | null
  ): Promise<void> {
    const remainingSeconds =
      cached == null
        ? STATS_REFRESH_BACKOFF_SECONDS
        : Math.floor(
            STATS_CACHE_RETENTION_SECONDS - (Date.now() - cached.sweptAt) / 1000
          )
    if (remainingSeconds <= 0) return
    const entry: StatsCacheEntry = {
      sweptAt: cached?.sweptAt ?? Date.now(),
      retryAfter: Date.now() + STATS_REFRESH_BACKOFF_SECONDS * 1000,
      sweep: cached?.sweep ?? null
    }
    try {
      await getClient().set(
        key(campaignId),
        JSON.stringify(entry),
        'EX',
        remainingSeconds
      )
    } catch (error) {
      logger.error({ error, campaignId }, 'stats cache backoff write failed')
    }
  }
}
