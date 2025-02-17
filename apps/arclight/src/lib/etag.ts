import { NextRequest } from 'next/server'

/**
 * Generates an optimized hash using Web Crypto API
 * Uses a faster hashing algorithm for better performance while maintaining security
 */
async function generateHash(content: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Generates an ETag for the given content with content encoding
 */
export async function generateETag(
  content: string,
  encoding: string = 'gzip'
): Promise<string> {
  const hash = await generateHash(content)
  return `"${hash}-${encoding}"`
}

/**
 * Gets the current date in RFC 2822 format with caching
 */
const getCurrentDate = (() => {
  let cachedDate: string | null = null
  let lastUpdate = 0
  const UPDATE_INTERVAL = 1000

  return function (): string {
    const now = Date.now()
    if (cachedDate === null || now - lastUpdate > UPDATE_INTERVAL) {
      cachedDate = new Date().toUTCString()
      lastUpdate = now
    }
    return cachedDate
  }
})()

/**
 * Checks if the request's If-None-Match header matches the ETag
 */
export function isETagMatch(request: NextRequest, etag: string): boolean {
  const ifNoneMatch = request.headers.get('if-none-match')
  if (!ifNoneMatch) return false
  return ifNoneMatch.split(/,\s*/).some((tag) => tag === etag || tag === '*')
}

/**
 * Creates a Response with optimized ETag handling
 */
export async function createETagResponse(
  request: NextRequest,
  content: string,
  status = 200,
  headers: Record<string, string> = {}
): Promise<Response> {
  console.log('headers', headers)
  const encoding = headers['content-encoding'] ?? 'gzip'
  const etag = await generateETag(content, encoding)
  const currentDate = getCurrentDate()

  const commonHeaders = {
    'cache-control':
      headers['cache-control'] ?? 'max-age=0, must-revalidate, private',
    date: currentDate,
    etag,
    expires: currentDate,
    'last-modified': currentDate,
    vary: headers['vary'] ?? 'Accept-Encoding',
    'content-encoding': encoding
  }

  if (isETagMatch(request, etag)) {
    return new Response(null, {
      status: 304,
      headers: {
        ...headers,
        'content-type': 'text/plain;charset=UTF-8',
        ...commonHeaders
      }
    })
  }

  return new Response(content, {
    status,
    headers: {
      ...headers,
      'content-type': headers['content-type'] ?? 'application/json',
      ...commonHeaders
    }
  })
}
