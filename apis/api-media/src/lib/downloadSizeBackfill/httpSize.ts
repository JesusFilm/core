import fetch from 'node-fetch'

import type { HttpSizeClient, ResolveSizeResult } from './types'

// A host that accepts the connection but never sends headers would otherwise
// hold a concurrency slot indefinitely. Both HEAD and Range requests carry a
// deadline so they always settle.
const HTTP_REQUEST_TIMEOUT_MS = 10_000

function parseContentRangeTotal(header: string | null): number | null {
  if (header == null) return null
  const match = /\/(\d+)\s*$/.exec(header)
  if (match == null) return null
  const total = Number(match[1])
  return Number.isFinite(total) && total > 0 ? total : null
}

/**
 * Real HTTP client backing HttpSizeClient. HEAD requests never touch the
 * body. Range requests ask for a single byte and abort the connection
 * immediately after headers arrive, so a full file is never streamed
 * merely to measure it.
 */
export function createFetchHttpSizeClient(): HttpSizeClient {
  return {
    async head(url) {
      const controller = new AbortController()
      const timer = setTimeout(
        () => controller.abort(),
        HTTP_REQUEST_TIMEOUT_MS
      )
      try {
        const response = await fetch(url, {
          method: 'HEAD',
          signal: controller.signal
        })
        return {
          ok: response.ok,
          status: response.status,
          contentLength: response.headers.get('content-length'),
          contentRangeTotal: parseContentRangeTotal(
            response.headers.get('content-range')
          )
        }
      } finally {
        clearTimeout(timer)
      }
    },
    async rangeGet(url) {
      const controller = new AbortController()
      const timer = setTimeout(
        () => controller.abort(),
        HTTP_REQUEST_TIMEOUT_MS
      )
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: { Range: 'bytes=0-0' },
          signal: controller.signal
        })
        return {
          ok: response.ok || response.status === 206,
          status: response.status,
          contentLength: response.headers.get('content-length'),
          contentRangeTotal: parseContentRangeTotal(
            response.headers.get('content-range')
          )
        }
      } finally {
        clearTimeout(timer)
        controller.abort()
      }
    }
  }
}

// A Content-Length is a decimal byte count, so only a strictly digit string
// is meaningful -- bare `Number()` also accepts `12.5`, `1e10` and `0x1F`.
// This mirrors parseMuxFilesize in resolveMuxSize.ts. The distinction matters
// because the repair query only reselects rows that are still null or
// nonpositive: a bogus positive value written here is never revisited.
const CONTENT_LENGTH_PATTERN = /^[0-9]+$/

function toPositiveSize(value: string | null): number | null {
  if (value == null || !CONTENT_LENGTH_PATTERN.test(value.trim())) return null
  const size = Number(value.trim())
  return Number.isSafeInteger(size) && size > 0 ? size : null
}

/**
 * HEAD first; a one-byte Range request only when HEAD does not yield a
 * usable length. For a 206 Partial Content response, only Content-Range's
 * total is trustworthy — Content-Length there describes the one-byte chunk,
 * not the file. A 200 response to a Range request means the server ignored
 * it and returned the full Content-Length as the total.
 */
export async function resolveHttpSize(
  url: string,
  client: HttpSizeClient
): Promise<ResolveSizeResult> {
  try {
    const head = await client.head(url)
    if (head.ok) {
      const size = toPositiveSize(head.contentLength)
      if (size != null) return { size, errorCode: null }
    }
  } catch {
    // fall through to the Range fallback
  }

  try {
    const range = await client.rangeGet(url)
    if (range.status === 206) {
      if (range.contentRangeTotal != null) {
        return { size: range.contentRangeTotal, errorCode: null }
      }
      return { size: null, errorCode: 'invalidLength' }
    }
    if (range.ok) {
      const size = toPositiveSize(range.contentLength)
      if (size != null) return { size, errorCode: null }
    }
  } catch {
    return { size: null, errorCode: 'httpUnreachable' }
  }

  return { size: null, errorCode: 'httpUnreachable' }
}
