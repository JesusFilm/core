import type { Context } from 'hono'

import { getWithStaleCache } from './cache'

export function isCacheBypassEnabled(c: Context): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return c.req.header('x-cache-bypass') === 'true'
}

export async function getWithStaleCacheForRequest<T>(
  c: Context,
  key: string,
  fetchFn: () => Promise<T>
): Promise<T> {
  return getWithStaleCache(key, fetchFn, {
    bypass: isCacheBypassEnabled(c)
  })
}
