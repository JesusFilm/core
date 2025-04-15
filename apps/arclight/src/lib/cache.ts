import { Redis } from 'ioredis'

if (process.env.REDIS_URL == null) {
  throw new Error('REDIS_URL is not set')
}

const redis = new Redis(process.env.REDIS_URL)

const DEFAULT_TTL = 3600 * 24 // 1 day
const STALE_TTL = 3600 * 4 // 4 hours

interface CacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
}

export async function getFromCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  if (!data) return null
  return JSON.parse(data)
}

export async function setInCache<T>(
  key: string,
  data: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = DEFAULT_TTL, staleWhileRevalidate = true } = options

  await redis.set(key, JSON.stringify(data), 'EX', ttl)

  if (staleWhileRevalidate) {
    await redis.set(`${key}:stale`, JSON.stringify(data), 'EX', ttl + STALE_TTL)
  }
}

export async function getWithStaleCache<T>(
  key: string,
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get fresh data
  const cached = await getFromCache<T>(key)
  if (cached) return cached

  // Try to get stale data
  const stale = await getFromCache<T>(`${key}:stale`)

  // If we have stale data, return it and refresh in background
  if (stale) {
    void fetchFn().then((newData) => setInCache(key, newData, options))
    return stale
  }

  // If no cached data, fetch fresh
  const fresh = await fetchFn()
  void setInCache(key, fresh, options)
  return fresh
}

export async function invalidateCache(key: string): Promise<void> {
  await Promise.all([redis.del(key), redis.del(`${key}:stale`)])
}

export function generateCacheKey(parts: (string | number)[]): string {
  return parts.join(':')
}
