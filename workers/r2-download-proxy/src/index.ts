import { Hono } from 'hono'
import { cors } from 'hono/cors'

interface Env {
  ALLOWED_ORIGINS?: string
}

const app = new Hono<{ Bindings: Env }>()

// Configure CORS middleware
app.use('*', async (c, next) => {
  const allowedOrigins = c.env.ALLOWED_ORIGINS?.split(',') || []
  const origin = c.req.header('Origin') || ''

  // Check if origin is allowed
  const isAllowedOrigin = allowedOrigins.some(
    (allowedOrigin) => origin === allowedOrigin.trim()
  )

  if (isAllowedOrigin) {
    c.header('Access-Control-Allow-Origin', origin)
  }

  c.header('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS')
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Range')
  c.header(
    'Access-Control-Expose-Headers',
    'Content-Length, Content-Range, Accept-Ranges'
  )
  c.header('Access-Control-Max-Age', '86400')

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 })
  }

  await next()
})

// Handle R2 download requests
app.get('/*', async (c) => {
  try {
    // Extract the R2 URL from the path
    const path = c.req.path.substring(1) // Remove leading slash

    // Validate that this looks like an R2 URL
    if (
      !path.includes('.r2.cloudflarestorage.com') &&
      !path.includes('.r2.dev')
    ) {
      return new Response('Invalid R2 URL', { status: 400 })
    }

    // Construct the full R2 URL
    const r2Url = path.startsWith('https://') ? path : `https://${path}`

    // Forward the request to R2
    const response = await fetch(r2Url, {
      method: c.req.method,
      headers: {
        // Forward necessary headers but filter out problematic ones
        Range: c.req.header('Range') || '',
        'If-Range': c.req.header('If-Range') || '',
        'If-Modified-Since': c.req.header('If-Modified-Since') || '',
        'Cache-Control': c.req.header('Cache-Control') || ''
      }
    })

    if (!response.ok) {
      console.error(
        `R2 request failed: ${response.status} ${response.statusText}`
      )
      return new Response(`Failed to fetch from R2: ${response.statusText}`, {
        status: response.status
      })
    }

    // Create response with proper headers
    const headers = new Headers()

    // Copy important headers from R2 response
    const headersToForward = [
      'content-type',
      'content-length',
      'content-range',
      'accept-ranges',
      'last-modified',
      'etag',
      'cache-control'
    ]

    headersToForward.forEach((header) => {
      const value = response.headers.get(header)
      if (value) {
        headers.set(header, value)
      }
    })

    // Add content-disposition for downloads
    const filename = extractFilenameFromUrl(r2Url)
    if (filename) {
      headers.set('Content-Disposition', `attachment; filename="${filename}"`)
    }

    return new Response(response.body, {
      status: response.status,
      headers
    })
  } catch (error) {
    console.error('Proxy error:', error)
    return new Response('Internal Server Error', { status: 500 })
  }
})

// Helper function to extract filename from URL
function extractFilenameFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url)
    const pathname = urlObj.pathname
    const filename = pathname.split('/').pop()
    return filename || null
  } catch {
    return null
  }
}

export default app
