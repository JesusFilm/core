import type { Env } from './env'

export type AdminProxyEnv = Pick<
  Env,
  'ADMIN_HOSTNAME' | 'ADMIN_PATH' | 'ADMIN_PROXY_DEST'
>

function trimTrailingSlashes(path: string): string {
  return path.replace(/\/+$/, '')
}

/**
 * Pure: true when the admin proxy is fully configured and the request is for
 * the admin dashboard, i.e. the host equals `ADMIN_HOSTNAME` (case-insensitive)
 * and the path equals `ADMIN_PATH` or sits below it (`ADMIN_PATH + '/'`).
 * `host` is the normalised (lower-cased, port-stripped) request host.
 */
export function isAdminRequest(
  host: string,
  pathname: string,
  env: AdminProxyEnv
): boolean {
  const adminHostname = (env.ADMIN_HOSTNAME ?? '').trim()
  const adminPath = trimTrailingSlashes((env.ADMIN_PATH ?? '').trim())
  const proxyDest = (env.ADMIN_PROXY_DEST ?? '').trim()

  if (adminHostname === '' || adminPath === '' || proxyDest === '') return false
  if (host.toLowerCase() !== adminHostname.toLowerCase()) return false

  return pathname === adminPath || pathname.startsWith(`${adminPath}/`)
}

/**
 * Proxies an admin dashboard request to `ADMIN_PROXY_DEST` (the Vercel
 * deployment of `short-links-admin`): same path, query, method, headers and
 * body, over https, never following redirects. The upstream response is
 * returned with its status, headers and body untouched so `Set-Cookie` and
 * `Location` survive.
 */
export async function proxyAdminRequest(
  request: Request,
  env: AdminProxyEnv
): Promise<Response> {
  const publicUrl = new URL(request.url)

  const upstreamUrl = new URL(publicUrl)
  upstreamUrl.protocol = 'https:'
  upstreamUrl.hostname = (env.ADMIN_PROXY_DEST ?? '').trim()
  upstreamUrl.port = ''

  const headers = new Headers(request.headers)
  headers.set('x-forwarded-host', publicUrl.host)
  headers.set('x-forwarded-proto', publicUrl.protocol.slice(0, -1))

  const isBodyless = request.method === 'GET' || request.method === 'HEAD'

  let upstream: Response
  try {
    upstream = await fetch(
      new Request(upstreamUrl.toString(), {
        method: request.method,
        headers,
        body: isBodyless ? undefined : request.body,
        redirect: 'manual'
      })
    )
  } catch (error) {
    console.error(JSON.stringify({ event: 'admin_proxy_failed' }), error)
    return new Response('Service Unavailable', { status: 503 })
  }

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: upstream.headers
  })
}
