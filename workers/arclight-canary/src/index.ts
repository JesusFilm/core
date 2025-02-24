import { Hono } from 'hono'

/**
 * Environment variables expected by the worker
 * ENDPOINT_CORE: The base URL for the core API endpoint
 * ENDPOINT_ARCLIGHT: The base URL for the arclight API endpoint
 * ENDPOINT_ARCLIGHT_WEIGHT: Percentage (0-100) of requests to route to arclight
 */
type Bindings = {
  ENDPOINT_CORE?: string
  ENDPOINT_ARCLIGHT?: string
  ENDPOINT_ARCLIGHT_WEIGHT?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * Determines if a request should be routed to the arclight endpoint
 * based on the configured weight percentage
 * @param weight - Percentage (0-100) of requests to route to arclight
 * @returns boolean - true if should route to arclight, false for core
 */
const shouldUseArclight = (weight: number): boolean => {
  return Math.random() * 100 < weight
}

/**
 * Removes any undefined or null values from response headers
 * to prevent serialization issues
 * @param headers - Response headers from the upstream service
 * @returns HeadersInit - Sanitized headers object
 */
const sanitizeHeaders = (headers: Headers): HeadersInit => {
  return Object.fromEntries(
    Array.from(headers.entries()).filter(
      ([, value]) => value !== undefined && value !== null
    )
  )
}

/**
 * Main request handler that implements canary routing logic
 * - Randomly routes requests between core and arclight endpoints
 * - Preserves original request properties (method, headers, body)
 * - Handles errors gracefully
 */
app.all('*', async (c) => {
  // Parse the incoming request URL
  const url = new URL(c.req.url)

  // Get the configured weight for arclight routing (defaults to 50%)
  const weight = parseInt(c.env.ENDPOINT_ARCLIGHT_WEIGHT ?? '50', 10)

  // Determine which endpoint to use based on random weight
  const baseEndpoint = shouldUseArclight(weight)
    ? c.env.ENDPOINT_ARCLIGHT
    : c.env.ENDPOINT_CORE

  // Ensure we have a valid endpoint configured
  if (!baseEndpoint) {
    console.error('Missing endpoint configuration')
    return new Response('Internal Server Error', { status: 500 })
  }

  // Construct the target URL preserving the original path and query
  const targetUrl = new URL(url.pathname + url.search, baseEndpoint)

  try {
    // Forward the request to the selected endpoint
    const response = await fetch(targetUrl.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      // Only include body for non-GET/HEAD requests
      body:
        c.req.method !== 'GET' && c.req.method !== 'HEAD'
          ? await c.req.raw.clone().arrayBuffer()
          : undefined,
      redirect: 'manual' // Prevent automatic redirect following
    })

    // Return the response with sanitized headers
    return new Response(response.body, {
      status: response.status,
      headers: sanitizeHeaders(response.headers)
    })
  } catch (error) {
    // Log and handle any network or upstream service errors
    console.error('Proxy fetch error:', error)
    return new Response('Service Unavailable', { status: 503 })
  }
})

export default app
