import type { ShortLinkHealth } from '@core/prisma/media/client'

export const REQUEST_TIMEOUT_MS = 10_000
export const MAX_REDIRECTS = 10

const REDIRECT_STATUSES = [301, 302, 303, 307, 308]
const METHOD_NOT_ALLOWED_STATUSES = [405, 501]

interface ErrorWithCause {
  name?: string
  code?: string
  message?: string
  cause?: ErrorWithCause
}

/**
 * Walk the `cause` chain (undici wraps network failures in
 * `TypeError: fetch failed` with the real error as `cause`).
 */
function errorCodes(error: unknown): string[] {
  const codes: string[] = []
  let current: ErrorWithCause | undefined =
    typeof error === 'object' && error != null ? error : undefined
  let depth = 0
  while (current != null && depth < 5) {
    if (current.code != null) codes.push(current.code)
    if (current.name != null) codes.push(current.name)
    if (current.message != null) codes.push(current.message)
    current = current.cause
    depth += 1
  }
  return codes
}

const DNS_CODES = ['ENOTFOUND', 'EAI_AGAIN']
const TLS_PATTERN = /CERT|TLS|SSL|ALTNAME/i
const REDIRECT_LOOP_PATTERN = /TOO_MANY_REDIRECTS|max redirects|redirect count/i

export function classifyError(error: unknown): ShortLinkHealth {
  const codes = errorCodes(error)
  if (codes.some((code) => code === 'AbortError' || code === 'TimeoutError'))
    return 'timeout'
  if (codes.some((code) => DNS_CODES.includes(code))) return 'dns'
  if (codes.some((code) => REDIRECT_LOOP_PATTERN.test(code)))
    return 'redirectLoop'
  if (codes.some((code) => TLS_PATTERN.test(code))) return 'tls'
  return 'unknown'
}

/**
 * Only statuses that unambiguously mean "this destination is gone" count as
 * failures; anything else (2xx, 3xx, bot-protection 403s, rate limits) is
 * treated as reachable so a healthy site is never paused by a cautious WAF.
 */
export function classifyStatus(status: number): ShortLinkHealth {
  if (status === 404 || status === 410) return 'notFound'
  if (status >= 500) return 'serverError'
  return 'ok'
}

async function fetchWithTimeout(
  url: string,
  method: 'HEAD' | 'GET'
): Promise<Response> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await fetch(url, {
      method,
      redirect: 'manual',
      signal: controller.signal,
      headers: {
        'User-Agent':
          'JesusFilm-ShortLinkHealth/1.0 (+https://www.jesusfilm.org)'
      }
    })
  } finally {
    clearTimeout(timer)
  }
}

class RedirectLoopError extends Error {
  code = 'ERR_TOO_MANY_REDIRECTS'
  constructor() {
    super('too many redirects')
    this.name = 'RedirectLoopError'
  }
}

/** Follow redirects by hand so a loop is detected at a known hop count. */
async function requestFollowingRedirects(
  url: string,
  method: 'HEAD' | 'GET'
): Promise<Response> {
  let currentUrl = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetchWithTimeout(currentUrl, method)
    if (!REDIRECT_STATUSES.includes(response.status)) return response
    const location = response.headers.get('location')
    if (location == null) return response
    await response.body?.cancel()
    currentUrl = new URL(location, currentUrl).toString()
  }
  throw new RedirectLoopError()
}

/**
 * HEAD first; GET when HEAD is refused or fails, since many origins answer
 * HEAD differently from GET.
 */
export async function checkDestination(url: string): Promise<ShortLinkHealth> {
  try {
    const headResponse = await requestFollowingRedirects(url, 'HEAD')
    await headResponse.body?.cancel()
    if (
      headResponse.ok ||
      REDIRECT_STATUSES.includes(headResponse.status) ||
      (headResponse.status < 400 && headResponse.status >= 300)
    )
      return 'ok'
    if (
      !METHOD_NOT_ALLOWED_STATUSES.includes(headResponse.status) &&
      classifyStatus(headResponse.status) === 'ok'
    )
      return 'ok'

    const getResponse = await requestFollowingRedirects(url, 'GET')
    await getResponse.body?.cancel()
    return classifyStatus(getResponse.status)
  } catch (error) {
    return classifyError(error)
  }
}
