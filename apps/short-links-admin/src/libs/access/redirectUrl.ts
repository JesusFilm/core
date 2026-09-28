import type { NextRequest } from 'next/server'

/**
 * Where to send the browser for an in-app redirect.
 *
 * `req.nextUrl` carries the base path, so setting `pathname` to an app path
 * yields `/s/dashboard/<path>`. Behind the edge Worker the request host is the
 * Vercel deployment while the browser is on the public host, so the Worker's
 * `x-forwarded-host` / `x-forwarded-proto` win over the request's own host.
 */
export function getRedirectUrl(req: NextRequest, pathname: string): URL {
  const url = req.nextUrl.clone()
  url.pathname = pathname

  const forwardedHost = req.headers
    .get('x-forwarded-host')
    ?.split(',')[0]
    .trim()
  if (forwardedHost == null || forwardedHost === '') return url

  const forwardedProto = req.headers
    .get('x-forwarded-proto')
    ?.split(',')[0]
    .trim()
  url.port = ''
  url.host = forwardedHost
  if (forwardedProto === 'https' || forwardedProto === 'http')
    url.protocol = `${forwardedProto}:`

  return url
}
