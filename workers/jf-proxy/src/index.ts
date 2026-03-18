import { Hono } from 'hono'

const CACHE_MAX_AGE = 86400 // 24 hours

const app = new Hono<{
  Bindings: {
    RESOURCES_PROXY_DEST?: string
    WATCH_PROXY_DEST?: string
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

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname

  // Check if path is /watch and has EXPERIMENTAL cookie
  const cookieHeader = c.req.header('cookie')
  const hasExperimentalCookie = cookieHeader?.includes('EXPERIMENTAL')
  const isWatchPath = pathname.startsWith('/watch')

  // Set destination based on path and cookie
  const proxyDest =
    isWatchPath && hasExperimentalCookie
      ? (c.env.WATCH_PROXY_DEST ?? url.hostname)
      : (c.env.RESOURCES_PROXY_DEST ?? url.hostname)

  url.hostname = proxyDest

  let response: Response

  // Extract headers from the original request, including cookies
  const headers = new Headers()

  // Copy all headers from the original request
  const originalHeaders = c.req.header()
  if (originalHeaders) {
    Object.entries(originalHeaders).forEach(([key, value]) => {
      if (value) {
        headers.set(key, value)
      }
    })
  }

  // Ensure cookies are properly passed
  if (cookieHeader) {
    headers.set('cookie', cookieHeader)
  }

  try {
    response = await fetch(
      url
        .toString()
        .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase()),
      {
        method: c.req.method,
        headers,
        redirect: 'manual'
      }
    )
  } catch (error) {
    console.error('Proxy fetch error:', error)
    return new Response('Service Unavailable', { status: 503 })
  }

  if (response.status == 404 || response.status == 500) {
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
