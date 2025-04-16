import { Redis } from 'ioredis'

export const connection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379,
  connectTimeout: 5000, // 5 second connection timeout
  maxRetriesPerRequest: 2,
  retryStrategy(times: number) {
    console.log(`[Redis] Retry attempt ${times}`)
    if (times > 3) {
      console.log('[Redis] Max retries reached, giving up')
      return null // stop retrying after 3 attempts
    }
    const delay = Math.min(times * 200, 1000)
    console.log(`[Redis] Retrying in ${delay}ms`)
    return delay // exponential backoff with max 1s
  }
}

console.log('[Redis] Initializing with config:', {
  ...connection,
  // Don't log any sensitive info that might be in the URL
  host: connection.host === 'redis' ? 'redis' : 'custom-host'
})

const redis = new Redis(connection)

redis.on('connect', () => {
  console.log('[Redis] Connected successfully')
})

redis.on('error', (err) => {
  console.error('[Redis] Connection error:', err)
})

redis.on('close', () => {
  console.log('[Redis] Connection closed')
})

redis.on('reconnecting', (ms: number) => {
  console.log(`[Redis] Reconnecting in ${ms}ms`)
})

const DEFAULT_TTL = 3600 * 24 // 1 day
const STALE_TTL = 3600 * 4 // 4 hours
const REDIS_OP_TIMEOUT = 3000 // 3 second timeout for Redis operations

interface CacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
}

async function getFromCache<T>(key: string): Promise<T | null> {
  const startTime = Date.now()
  try {
    console.log(`[Redis] Getting key: ${key}`)
    const data = await Promise.race([
      redis.get(key),
      new Promise<null>((_, reject) =>
        setTimeout(
          () => reject(new Error('Redis get timeout')),
          REDIS_OP_TIMEOUT
        )
      )
    ])
    const duration = Date.now() - startTime
    if (!data) {
      console.log(`[Redis] Key ${key} not found (${duration}ms)`)
      return null
    }
    console.log(`[Redis] Got key ${key} (${duration}ms)`)
    return JSON.parse(data)
  } catch (err) {
    const duration = Date.now() - startTime
    console.error(`[Redis] Failed to get key ${key} (${duration}ms):`, err)
    return null
  }
}

async function setInCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options
  const startTime = Date.now()

  try {
    console.log(`[Redis] Setting key: ${key}`)
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
    const duration = Date.now() - startTime
    console.log(`[Redis] Set key ${key} (${duration}ms)`)

    if (staleWhileRevalidate) {
      console.log(`[Redis] Setting stale key: ${key}:stale`)
      const staleStartTime = Date.now()
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
      const staleDuration = Date.now() - staleStartTime
      console.log(`[Redis] Set stale key ${key}:stale (${staleDuration}ms)`)
    }
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(`[Redis] Failed to set key ${key} (${duration}ms):`, error)
  }
}

export async function getWithStaleCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  const startTime = Date.now()
  try {
    console.log(`[Redis] Attempting to get cached data for key: ${key}`)
    const cached = await getFromCache<T>(key)
    if (cached) {
      console.log(`[Redis] Cache hit for key: ${key}`)
      return cached
    }

    console.log(`[Redis] Cache miss, checking stale data for key: ${key}`)
    const stale = await getFromCache<T>(`${key}:stale`)

    if (stale) {
      console.log(`[Redis] Using stale data for key: ${key}`)
      // Background refresh without waiting
      void fetchFn()
        .then((newData) => {
          console.log(`[Redis] Background refresh successful for key: ${key}`)
          return setInCache(key, newData, options)
        })
        .catch((error) =>
          console.error(
            `[Redis] Background refresh failed for key ${key}:`,
            error
          )
        )
      return stale
    }

    console.log(
      `[Redis] No cached or stale data, fetching fresh for key: ${key}`
    )
    const fresh = await fetchFn()
    const duration = Date.now() - startTime
    console.log(`[Redis] Got fresh data for key ${key} (${duration}ms)`)

    void setInCache(key, fresh, options).catch((error) =>
      console.error(`[Redis] Failed to cache fresh data for key ${key}:`, error)
    )
    return fresh
  } catch (error) {
    const duration = Date.now() - startTime
    console.error(
      `[Redis] Error retrieving from cache for key ${key} (${duration}ms):`,
      error
    )
    return await fetchFn()
  }
}

export function generateCacheKey(parts: (string | number)[]): string {
  const key = parts.join(':')
  console.log(`[Redis] Generated cache key: ${key}`)
  return key
}
