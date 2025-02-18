import { NextRequest } from 'next/server'
/**
 * Generates an ETag for the given content
 */
export async function generateETag(content: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(content)
  const hashBuffer = await crypto.subtle.digest('SHA-1', msgUint8)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  return `"${hashHex}"`
}

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
  status = 200
): Promise<Response> {
  const etag = await generateETag(content)

  return new Response(content, {
    status,
    headers: {
      'Content-Type': 'application/json',
      ETag: etag
    }
  })
}
