// Shared utilities for redirect routes

export function setCorsHeaders(c: any) {
  c.header('Access-Control-Allow-Origin', '*')
  c.header('Access-Control-Allow-Methods', 'GET, OPTIONS')
  c.header('Access-Control-Allow-Headers', '*')
  c.header('Access-Control-Expose-Headers', '*')
}

export function getClientIp(c: any): string | undefined {
  const forwardedFor = c.req.header('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim()
  }
  const realIp = c.req.header('x-real-ip')
  if (realIp) {
    return realIp
  }
  // Fallback for direct connections (like localhost)
  return c.env?.remoteAddr?.address
}
