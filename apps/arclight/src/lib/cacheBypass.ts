import type { Context } from 'hono'

export function isCacheBypassEnabled(c: Context): boolean {
  return c.req.header('x-cache-bypass') === 'true'
}
