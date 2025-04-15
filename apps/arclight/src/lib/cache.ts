import { Redis } from 'ioredis'

export const connection = {
  host: process.env.REDIS_URL ?? 'redis',
  port: process.env.REDIS_PORT != null ? Number(process.env.REDIS_PORT) : 6379
}

const redis = new Redis(connection)
redis.on('error', (err) => {
  console.error('Redis error', err)
})

const DEFAULT_TTL = 3600 * 24 // 1 day
const STALE_TTL = 3600 * 4 // 4 hours

interface CacheOptions {
  ttl?: number
  staleWhileRevalidate?: boolean
}

async function getFromCache<T>(key: string): Promise<T | null> {
  const data = await redis.get(key)
  if (!data) return null
  try {
    return JSON.parse(data)
  } catch (err) {
    console.error('Failed to parse cache data for key', key, err)
    return null
  }
}

async function setInCache<T>(
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
  const cached = await getFromCache<T>(key)
  if (cached) return cached

  const stale = await getFromCache<T>(`${key}:stale`)

  if (stale) {
    void fetchFn()
      .then((newData) => setInCache(key, newData, options))
      .catch((err) => {
        console.error('Failed to set stale cache for key', key, err)
      })
    return stale
  }

  const fresh = await fetchFn()
  void setInCache(key, fresh, options)
  return fresh
}

export function generateCacheKey(parts: (string | number)[]): string {
  return parts.join(':')
}
