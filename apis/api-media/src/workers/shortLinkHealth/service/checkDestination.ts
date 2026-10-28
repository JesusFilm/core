import dns from 'node:dns'
import http from 'node:http'
import https from 'node:https'
import { type LookupFunction, isIP } from 'node:net'

import type { ShortLinkHealth } from '@core/prisma/media/client'

import { isPublicWebUrl } from '../../../schema/shortLink/lib/destination'

export const REQUEST_TIMEOUT_MS = 10_000
export const MAX_REDIRECTS = 10

const REDIRECT_STATUSES = [301, 302, 303, 307, 308]
const METHOD_NOT_ALLOWED_STATUSES = [405, 501]

// Preserve native fetch's forbidden-port behavior when using the socket client.
// https://fetch.spec.whatwg.org/#port-blocking
const FETCH_BLOCKED_PORTS = new Set([
  '1',
  '7',
  '9',
  '11',
  '13',
  '15',
  '17',
  '19',
  '20',
  '21',
  '22',
  '23',
  '25',
  '37',
  '42',
  '43',
  '53',
  '69',
  '77',
  '79',
  '87',
  '95',
  '101',
  '102',
  '103',
  '104',
  '109',
  '110',
  '111',
  '113',
  '115',
  '117',
  '119',
  '123',
  '135',
  '137',
  '139',
  '143',
  '161',
  '179',
  '389',
  '427',
  '465',
  '512',
  '513',
  '514',
  '515',
  '526',
  '530',
  '531',
  '532',
  '540',
  '548',
  '554',
  '556',
  '563',
  '587',
  '601',
  '636',
  '989',
  '990',
  '993',
  '995',
  '1719',
  '1720',
  '1723',
  '2049',
  '3659',
  '4045',
  '4190',
  '5060',
  '5061',
  '6000',
  '6566',
  '6665',
  '6666',
  '6667',
  '6668',
  '6669',
  '6679',
  '6697',
  '10080'
])

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

class PrivateDestinationError extends Error {
  code = 'ERR_PRIVATE_DESTINATION'
  constructor(url: string) {
    super(`refusing to fetch a non-public destination: ${url}`)
    this.name = 'PrivateDestinationError'
  }
}

/** Validate the exact answers handed to the socket, never a separate preflight lookup. */
const lookupPublicDestination: LookupFunction = (
  hostname,
  options,
  callback
) => {
  dns.lookup(hostname, { all: true, verbatim: true }, (error, addresses) => {
    if (error != null) {
      callback(error, '', 4)
      return
    }
    // URL parsing canonicalizes expanded/mapped IPv6 just like stored URLs.
    // Reject the whole answer set: family selection/fallback must never select
    // a private answer from a mixed A/AAAA result. Reuse the destination policy,
    // including its explicit local-development-only opt-in.
    if (
      addresses.length === 0 ||
      addresses.some(
        ({ address, family }) =>
          isIP(address) !== family ||
          !isPublicWebUrl(
            family === 6 ? `http://[${address}]/` : `http://${address}/`
          )
      )
    ) {
      callback(new PrivateDestinationError(hostname), '', 4)
      return
    }
    if (options.all) callback(null, addresses)
    else callback(null, addresses[0].address, addresses[0].family)
  })
}

type DestinationResponse = Pick<Response, 'status' | 'ok' | 'headers'>

async function fetchWithTimeout(
  url: string,
  method: 'HEAD' | 'GET'
): Promise<DestinationResponse> {
  // Every hop and HEAD/GET attempt gets a fresh connection and validated DNS.
  // IP literals bypass lookup in Node, so retain the lexical URL check too.
  if (!isPublicWebUrl(url)) throw new PrivateDestinationError(url)
  const destination = new URL(url)
  // Retain fetch's URL credential and forbidden-port rejection.
  if (
    destination.username !== '' ||
    destination.password !== '' ||
    FETCH_BLOCKED_PORTS.has(destination.port)
  )
    throw new TypeError('unsupported destination URL')
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)
  try {
    return await new Promise<DestinationResponse>((resolve, reject) => {
      const request = (
        destination.protocol === 'https:' ? https : http
      ).request(
        destination,
        {
          method,
          agent: false,
          lookup: lookupPublicDestination,
          signal: controller.signal,
          headers: {
            'User-Agent':
              'JesusFilm-ShortLinkHealth/1.0 (+https://www.jesusfilm.org)'
          }
        },
        (response) => {
          // Only status and Location are needed. Destroy immediately at headers,
          // including GET/redirect bodies that may be unbounded or never end.
          response.destroy()
          const status = response.statusCode ?? 0
          resolve({
            status,
            ok: status >= 200 && status < 300,
            headers: new Headers(
              response.headers.location == null
                ? undefined
                : { location: response.headers.location }
            )
          })
        }
      )
      request.on('upgrade', (_response, socket) => {
        socket.destroy()
        reject(new Error('unexpected protocol upgrade'))
      })
      request.on('error', reject)
      request.end()
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
): Promise<DestinationResponse> {
  let currentUrl = url
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const response = await fetchWithTimeout(currentUrl, method)
    if (!REDIRECT_STATUSES.includes(response.status)) return response
    const location = response.headers.get('location')
    if (location == null) return response
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
    return classifyStatus(getResponse.status)
  } catch (error) {
    return classifyError(error)
  }
}
