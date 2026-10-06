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
  sweep: CampaignStatsSweep
  /** Within the TTL; a stale sweep is only served when a refresh fails. */
  fresh: boolean
}

export const STATS_CACHE_TTL_SECONDS = 30 * 60

// Redis keeps an entry long after it stops being fresh so the last sweep is
// still there to serve when Plausible is down.
const STATS_CACHE_RETENTION_SECONDS = 24 * 60 * 60

interface StatsCacheEntry {
  sweptAt: number
  sweep: CampaignStatsSweep
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
      return {
        sweep: entry.sweep,
        fresh: Date.now() - entry.sweptAt < STATS_CACHE_TTL_SECONDS * 1000
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
  }
}
