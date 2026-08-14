import fetch from 'node-fetch'

import type { HttpSizeClient, ResolveSizeResult } from './types'

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
      const response = await fetch(url, { method: 'HEAD' })
      return {
        ok: response.ok,
        status: response.status,
        contentLength: response.headers.get('content-length'),
        contentRangeTotal: parseContentRangeTotal(
          response.headers.get('content-range')
        )
      }
    },
    async rangeGet(url) {
      const controller = new AbortController()
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
        controller.abort()
      }
    }
  }
}

function toPositiveSize(value: string | null): number | null {
  if (value == null) return null
  const size = Number(value)
  return Number.isFinite(size) && size > 0 ? size : null
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
