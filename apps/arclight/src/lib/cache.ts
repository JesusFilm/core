import { Redis } from 'ioredis'

import { logger as parentLogger } from '../logger'

// Create a Redis-specific child logger
const logger = parentLogger.child({ module: 'redis' })

/**
 * Cache Flow
 * 1. Try fresh cache
 * 2. If missing, try stale cache
 * 3. If stale cache hit:
 *    - Return stale data immediately
 *    - Refresh in background
 * 4. If no cache:
 *    - Fetch fresh data
 *    - Cache both fresh and stale copies
 *    - Return fresh data
 */

export const connection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379,
  connectTimeout: 5000, // 5 second connection timeout
  maxRetriesPerRequest: 2,
  retryStrategy(times: number) {
    if (times > 3) {
      logger.error('Max retries reached, giving up')
      return null // stop retrying after 3 attempts
    }
    const delay = Math.min(times * 200, 1000)
    return delay // exponential backoff with max 1s
  }
}

const redis = new Redis(connection)

redis.on('error', (err) => {
  logger.error({ error: err }, 'Redis connection error')
})

// Cache configuration
const DEFAULT_TTL = 3600 * 4 // 4 hours for main cache
const STALE_TTL = 3600 * 72 // 3 days for stale
const REDIS_OP_TIMEOUT = 3000 // 3 second operation timeout
const REFRESH_LOCK_TTL = 30 // 30 seconds lock TTL

async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const data = await Promise.race([
      redis.get(key),
      new Promise<null>((_, reject) =>
        setTimeout(
          () => reject(new Error('Redis get timeout')),
          REDIS_OP_TIMEOUT
        )
      )
    ])
    if (!data) {
      return null
    }
    return JSON.parse(data)
  } catch (err) {
    logger.error({ error: err, key }, 'Failed to get key from cache')
    return null
  }
}

async function setInCache<T>(key: string, data: T): Promise<void> {
  try {
    // Set fresh cache with new TTL
    await redis.set(key, JSON.stringify(data), 'EX', DEFAULT_TTL)
    await redis.set(`${key}:stale`, JSON.stringify(data), 'EX', STALE_TTL)
  } catch (error) {
    logger.error({ error, key }, 'Failed to set key in cache')
    throw error // Propagate error for better handling upstream
  }
}

async function acquireLock(key: string): Promise<boolean> {
  try {
    const lockKey = `${key}:lock`
    const result = await redis.set(lockKey, '1', 'EX', REFRESH_LOCK_TTL, 'NX')
    return result === 'OK'
  } catch (err) {
    logger.error({ error: err }, 'Failed to acquire lock')
    return false
  }
}

async function refreshCacheInBackground<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<void> {
  // Try to acquire lock first
  const lockAcquired = await acquireLock(key)
  if (!lockAcquired) {
    logger.debug({ key }, 'Refresh already in progress for key')
    return
  }

  try {
    const newData = await fetchFn()
    await setInCache(key, newData)
    logger.debug({ key }, 'Successfully refreshed cache for key')
  } catch (error) {
    logger.error(
      { error: error instanceof Error ? error.message : 'Unknown error', key },
      'Background refresh failed for key'
    )
  }
  // Lock will auto-expire after REFRESH_LOCK_TTL seconds
}

export async function getWithStaleCache<T>(
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  try {
    // Try fresh cache first
    const cached = await getFromCache<T>(key)
    if (cached) {
      return cached
    }

    // Try stale cache
    const stale = await getFromCache<T>(`${key}:stale`)
    if (stale) {
      // Background refresh without blocking
      void refreshCacheInBackground(key, fetchFn)
      return stale
    }

    // No cache hit - fetch fresh data
    const fresh = await fetchFn()
    try {
      await setInCache(key, fresh)
    } catch (cacheError) {
      logger.error(
        {
          error:
            cacheError instanceof Error ? cacheError.message : 'Unknown error',
          key
        },
        'Failed to cache fresh data for key'
      )
      // Continue since we still have the fresh data to return
    }
    return fresh
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      },
      'Error retrieving from cache for key'
    )
    return await fetchFn()
  }
}

/**
 * Strict cache: Only returns fresh cache, never stale, and always fetches fresh if expired.
 * TTL is short (default 30s) and configurable.
 */
export async function getWithStrictCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  ttlSeconds: number = 30
): Promise<T> {
  try {
    const cached = await getFromCache<T>(key)
    if (cached) {
      return cached
    }
    const fresh = await fetchFn()
    try {
      await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds)
    } catch (cacheError) {
      logger.error(
        {
          error:
            cacheError instanceof Error ? cacheError.message : 'Unknown error',
          key
        },
        'Failed to cache fresh data for key'
      )
      // Continue since we still have the fresh data to return
    }
    return fresh
  } catch (error) {
    logger.error(
      {
        error: error instanceof Error ? error.message : 'Unknown error',
        key
      },
      'Error retrieving from strict cache for key'
    )
    return await fetchFn()
  }
}

export function generateCacheKey(parts: (string | number)[]): string {
  return parts.join(':')
}
