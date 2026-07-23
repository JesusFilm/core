import { Hono } from 'hono'

import { resolveWatchRedirect } from './resolveWatchRedirect'

const CACHE_MAX_AGE = 86400 // 24 hours

const app = new Hono<{
  Bindings: {
    RESOURCES_PROXY_DEST?: string
    WATCH_PROXY_DEST?: string
    CORE_GRAPHQL_ENDPOINT?: string
    IOS_APP_ID?: string
    ANDROID_PACKAGE_NAME?: string
    ANDROID_SHA256_CERT_FINGERPRINT?: string
  }
}>()

app.on(
  'GET',
  ['/.well-known/apple-app-site-association', '/apple-app-site-association'],
  async (c) => {
    const iosAppId = c.env.IOS_APP_ID
    if (!iosAppId) return new Response('Not Configured', { status: 500 })

    const aasa = {
      applinks: {
        apps: [],
        details: [{ appID: iosAppId, paths: ['*', '/'] }]
      }
    }
    const body = JSON.stringify(aasa)
    return new Response(body, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`
      }
    })
  }
)

app.get('/.well-known/assetlinks.json', async (c) => {
  const packageName = c.env.ANDROID_PACKAGE_NAME
  const fingerprints = c.env.ANDROID_SHA256_CERT_FINGERPRINT
  if (!packageName || !fingerprints)
    return new Response('Not Configured', { status: 500 })

  const sha256List = fingerprints
    .split(',')
    .map((f) => f.trim())
    .filter(Boolean)
  const assetlinks = [
    {
      relation: ['delegate_permission/common.handle_all_urls'],
      target: {
        namespace: 'android_app',
        package_name: packageName,
        sha256_cert_fingerprints: sha256List
      }
    }
  ]
  const body = JSON.stringify(assetlinks)
  return new Response(body, {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`
    }
  })
})

app.on(
  'GET',
  [
    '/bin/jf/watch.html/:videoId/:languageId',
    '/bin/jf/watch.html/:videoId/:languageId/',
    '/api/jf/watch.html/:videoId/:languageId',
    '/api/jf/watch.html/:videoId/:languageId/'
  ],
  async (c) => {
    const result = await resolveWatchRedirect({
      videoId: c.req.param('videoId'),
      languageId: c.req.param('languageId'),
      graphQlEndpoint: c.env.CORE_GRAPHQL_ENDPOINT
    })

    if (result.type === 'redirect') {
      return c.redirect(result.location, 302)
    }

    if (result.type === 'notFound') {
      return new Response('Not Found', { status: 404 })
    }

    return new Response('Service Unavailable', { status: 503 })
  }
)

app.all('*', async (c) => {
  const publicUrl = new URL(c.req.url)
  const pathname = publicUrl.pathname
  const isWatchPath = pathname.startsWith('/watch')
  const isReadRequest = c.req.method === 'GET' || c.req.method === 'HEAD'

  if (!isWatchPath && !isReadRequest) {
    return c.notFound()
  }

  const proxyDest = isWatchPath
    ? (c.env.WATCH_PROXY_DEST ?? publicUrl.hostname)
    : (c.env.RESOURCES_PROXY_DEST ?? publicUrl.hostname)

  const upstreamUrl = new URL(publicUrl)
  upstreamUrl.hostname = proxyDest

  let response: Response

  const headers = new Headers(c.req.raw.headers)
  headers.set('x-forwarded-host', publicUrl.host)
  headers.set('x-forwarded-proto', publicUrl.protocol.slice(0, -1))

  try {
    const normalizedUpstreamUrl = upstreamUrl
      .toString()
      .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase())
    const body =
      c.req.method === 'GET' || c.req.method === 'HEAD'
        ? undefined
        : c.req.raw.body

    response = await fetch(
      new Request(normalizedUpstreamUrl, {
        method: c.req.method,
        headers,
        body,
        redirect: 'manual'
      })
    )
  } catch (error) {
    console.error('Proxy fetch error:', error)
    return new Response('Service Unavailable', { status: 503 })
  }

  if (
    c.req.method === 'GET' &&
    (response.status === 404 || response.status === 500)
  ) {
    const notFoundUrl = new URL(c.req.url)
    notFoundUrl.pathname = '/not-found.html'
    try {
      response = await fetch(notFoundUrl.toString(), {
        method: c.req.method,
        headers,
        redirect: 'manual'
      })
    } catch (error) {
      console.error('Not found page fetch error:', error)
      return new Response('Not Found', { status: 404 })
    }
  }

  // Sanitize response headers
  const sanitizedHeaders = Object.fromEntries(
    Array.from(response.headers.entries()).filter(
      ([, value]) => value !== undefined && value !== null
    )
  )

  return new Response(response.body, {
    status: response.status,
    headers: sanitizedHeaders
  })
})

export default app
