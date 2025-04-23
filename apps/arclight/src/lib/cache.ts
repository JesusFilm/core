import { Redis } from 'ioredis'

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
      console.error('[Redis] Max retries reached, giving up')
      return null // stop retrying after 3 attempts
    }
    const delay = Math.min(times * 200, 1000)
    return delay // exponential backoff with max 1s
  }
}

const redis = new Redis(connection)

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err)
})

// Production cache configuration
const DEFAULT_TTL = 3600 * 4 // 4 hours for main cache
const STALE_TTL = 3600 * 72 // 3 days for stale
const REDIS_OP_TIMEOUT = 3000

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
    console.error(`[Redis] Failed to get key ${key}:`, err)
    return null
  }
}

async function setInCache<T>(key: string, data: T): Promise<void> {
  try {
    // Check if data has changed
    const currentData = await getFromCache<T>(key)
    const dataUnchanged =
      currentData && JSON.stringify(currentData) === JSON.stringify(data)

    if (dataUnchanged) {
      // Even if data hasn't changed, refresh TTLs
      await redis.expire(key, DEFAULT_TTL)
      await redis.expire(`${key}:stale`, STALE_TTL)
      return
    }

    // Set fresh cache
    await redis.set(key, JSON.stringify(data), 'EX', DEFAULT_TTL)
    await redis.set(`${key}:stale`, JSON.stringify(data), 'EX', STALE_TTL)
  } catch (error) {
    console.error(`[Redis] Failed to set key ${key}:`, error)
  }
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
      // Background refresh without waiting
      void fetchFn()
        .then((newData) => setInCache(key, newData))
        .catch((error) =>
          console.error(
            `[Redis] Background refresh failed for key: ${key}`,
            error
          )
        )
      return stale
    }

    // No cache hit - fetch fresh data
    const fresh = await fetchFn()
    void setInCache(key, fresh).catch((error) =>
      console.error(`[Redis] Failed to cache fresh data for key ${key}:`, error)
    )
    return fresh
  } catch (error) {
    console.error(`[Redis] Error retrieving from cache for key ${key}:`, error)
    return await fetchFn()
  }
}

export function generateCacheKey(parts: (string | number)[]): string {
  return parts.join(':')
}
