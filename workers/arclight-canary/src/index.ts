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
  TIMEOUT?: string
  FORCE_API_KEYS_TO_ARCLIGHT?: string
  FORCE_API_KEYS_TO_CORE?: string
}

const app = new Hono<{ Bindings: Bindings }>()

/**
 * Paths that should always be routed to the core endpoint
 */
const CORE_ONLY_PATHS = ['/_next/']

/**
 * Paths that should always be routed to the arclight endpoint
 */
const ARCLIGHT_ONLY_PATHS = ['/build/v1harness/images/primary.png']

/**
 * Custom error for weight validation failures
 */
class WeightValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'WeightValidationError'
  }
}

/**
 * Validates and parses the weight string into a number
 * @param weightStr - String representation of weight percentage
 * @returns number - Parsed weight value
 * @throws WeightValidationError if weight is invalid
 */
const parseWeight = (weightStr: string): number => {
  const weight = Number(weightStr)
  if (
    Number.isNaN(weight) ||
    !Number.isInteger(weight) ||
    weight < 0 ||
    weight > 100
  ) {
    throw new WeightValidationError(
      'Weight must be an integer between 0 and 100'
    )
  }
  return weight
}

/**
 * Determines if a path or apiKey should always be routed to the core endpoint
 * @param path - Request path
 * @param apiKey - API key from URLSearchParams
 * @param forceKeys - Force keys string from environment variables
 * @returns boolean - true if should always use core endpoint
 */
const shouldAlwaysUseCore = (
  path: string,
  apiKey: string | null,
  forceKeys: string | undefined
): boolean => {
  if (apiKey && forceKeys) {
    const keys = forceKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (keys.includes(apiKey)) return true
  }
  return CORE_ONLY_PATHS.some((prefix) => path.startsWith(prefix))
}

/**
 * Determines if a path or apiKey should always be routed to the arclight endpoint
 * @param path - Request path
 * @param apiKey - API key from URLSearchParams
 * @param forceKeys - Force keys string from environment variables
 * @returns boolean - true if should always use arclight endpoint
 */
const shouldAlwaysUseArclight = (
  path: string,
  apiKey: string | null,
  forceKeys: string | undefined
): boolean => {
  if (apiKey && forceKeys) {
    const keys = forceKeys
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean)
    if (keys.includes(apiKey)) return true
  }
  return ARCLIGHT_ONLY_PATHS.some((exactPath) => path === exactPath)
}

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
const sanitizeHeaders = (headers: Headers): Record<string, string> => {
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
  const apiKey = url.searchParams.get('apiKey')

  try {
    // Get and validate the configured weight (defaults to 50%)
    const weight = parseWeight(c.env.ENDPOINT_ARCLIGHT_WEIGHT ?? '50')

    // Check path/apiKey-based routing rules
    const useArclight =
      shouldAlwaysUseArclight(
        url.pathname,
        apiKey,
        c.env.FORCE_API_KEYS_TO_ARCLIGHT
      ) ||
      (!shouldAlwaysUseCore(
        url.pathname,
        apiKey,
        c.env.FORCE_API_KEYS_TO_CORE
      ) &&
        shouldUseArclight(weight))
    const baseEndpoint = useArclight
      ? c.env.ENDPOINT_ARCLIGHT
      : c.env.ENDPOINT_CORE

    // Ensure we have a valid endpoint configured
    if (!baseEndpoint) {
      console.error('Missing endpoint configuration')
      return new Response('Internal Server Error', { status: 500 })
    }

    // Construct the target URL preserving the original path and query
    const targetUrl = new URL(url.pathname + url.search, baseEndpoint)

    const controller = new AbortController()
    const timeout = setTimeout(
      () => controller.abort(),
      c.env.TIMEOUT != null ? Number(c.env.TIMEOUT) : 30000
    ) // 30 seconds timeout

    // Forward the request to the selected endpoint
    const response = await fetch(targetUrl.toString(), {
      method: c.req.method,
      headers: c.req.raw.headers,
      signal: controller.signal,
      // Only include body for non-GET/HEAD requests
      body:
        c.req.method !== 'GET' && c.req.method !== 'HEAD'
          ? await c.req.raw.clone().arrayBuffer()
          : undefined,
      redirect: 'manual' // Prevent automatic redirect following
    }).finally(() => clearTimeout(timeout))

    // Get sanitized headers and add routing information
    const headers = sanitizeHeaders(response.headers)
    headers['x-routed-to'] = useArclight ? 'arclight' : 'core'

    // Return the response with sanitized headers
    return new Response(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    if (error instanceof WeightValidationError) {
      console.error('Weight validation error:', error)
      return new Response('Invalid Configuration: ' + error.message, {
        status: 400
      })
    }
    if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out')
      return new Response('Service Unavailable', { status: 503 })
    }
    if (error instanceof TypeError) {
      console.error('Network error:', error)
      return new Response('Service Unavailable', { status: 503 })
    }
    console.error('Unexpected error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

export default app
