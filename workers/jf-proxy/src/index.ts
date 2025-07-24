import { Hono } from 'hono'

const app = new Hono<{
  Bindings: {
    WATCH_PROXY_DEST?: string
    WATCH_MODERN_PROXY_DEST?: string
    WATCH_MODERN_PROXY_PATHS?: string[]
  }
}>()

app.get('*', async (c) => {
  const url = new URL(c.req.url)
  const pathname = url.pathname

  // Check if path should route to modern proxy
  const modernProxyPaths = c.env.WATCH_MODERN_PROXY_PATHS || []
  const shouldUseModernProxy = modernProxyPaths.some((pattern) => {
    try {
      const regex = new RegExp(pattern)
      return regex.test(pathname)
    } catch (error) {
      console.error('Invalid regex pattern:', pattern, error)
      return false
    }
  })

  // Set destination based on path matching
  const proxyDest = shouldUseModernProxy
    ? (c.env.WATCH_MODERN_PROXY_DEST ?? url.hostname)
    : (c.env.WATCH_PROXY_DEST ?? url.hostname)

  url.hostname = proxyDest

  // Modify path for /watch/modern/* routes by removing 'modern/' part
  if (shouldUseModernProxy && pathname.startsWith('/watch/modern/')) {
    url.pathname = pathname.replace('/watch/modern/', '/watch/')
  }

  let response: Response

  try {
    response = await fetch(
      url
        .toString()
        .replace(/(%[0-9A-F][0-9A-F])/g, (match) => match.toLowerCase()),
      { ...c.req, redirect: 'manual' }
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
        ...c.req,
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
