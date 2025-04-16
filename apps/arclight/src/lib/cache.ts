import { Redis } from 'ioredis'

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

const DEFAULT_TTL = 3600 * 24 // 1 day
const STALE_TTL = 3600 * 4 // 4 hours
const REDIS_OP_TIMEOUT = 3000 // 3 second timeout for Redis operations

interface CacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
}

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

async function setInCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options

  try {
    const setPromise = redis.set(key, JSON.stringify(data), 'EX', ttl)
    await Promise.race([
      setPromise,
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error('Redis set timeout')),
          REDIS_OP_TIMEOUT
        )
      )
    ])

    if (staleWhileRevalidate) {
      const stalePromise = redis.set(
        `${key}:stale`,
        JSON.stringify(data),
        'EX',
        ttl + STALE_TTL
      )
      await Promise.race([
        stalePromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Redis stale set timeout')),
            REDIS_OP_TIMEOUT
          )
        )
      ])
    }
  } catch (error) {
    console.error(`[Redis] Failed to set key ${key}:`, error)
  }
}

export async function getWithStaleCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  try {
    const cached = await getFromCache<T>(key)
    if (cached) {
      return cached
    }

    const stale = await getFromCache<T>(`${key}:stale`)

    if (stale) {
      // Background refresh without waiting
      void fetchFn()
        .then((newData) => setInCache(key, newData, options))
        .catch((error) =>
          console.error(
            `[Redis] Background refresh failed for key ${key}:`,
            error
          )
        )
      return stale
    }

    const fresh = await fetchFn()
    void setInCache(key, fresh, options).catch((error) =>
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
