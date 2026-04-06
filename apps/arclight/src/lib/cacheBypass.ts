import type { Context } from 'hono'

export function isCacheBypassEnabled(c: Context): boolean {
  if (process.env.NODE_ENV === 'production') return false
  return c.req.header('x-cache-bypass') === 'true'
}
