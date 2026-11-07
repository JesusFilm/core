import { isIP } from 'node:net'

import { readShortLinksEnv } from './env'

/**
 * A redirect destination (or fallback) must point at the public internet:
 * https, a real hostname, and never a loopback, private, link-local or
 * metadata address. The health check fetches these URLs from inside the VPC,
 * so without this an editor could probe internal services through it. The
 * one exception is `SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS=true`, local
 * development only.
 */
export const PUBLIC_HTTPS_URL_MESSAGE =
  'must be a public https URL (no IP addresses, localhost or internal hosts)'
export const PUBLIC_WEB_URL_MESSAGE =
  'must be a public http(s) URL (no IP addresses, localhost or internal hosts)'

const LOCAL_HOSTNAMES = new Set(['localhost', 'localhost.localdomain'])
const LOCAL_SUFFIXES = ['.localhost', '.local', '.internal', '.home.arpa']

function isPrivateIpv4(address: string): boolean {
  const octets = address.split('.').map(Number)
  if (octets.length !== 4 || octets.some((octet) => Number.isNaN(octet)))
    return true
  const [a, b] = octets
  return (
    a === 0 || // "this" network
    a === 10 ||
    a === 127 || // loopback
    (a === 100 && b >= 64 && b <= 127) || // carrier-grade NAT
    (a === 169 && b === 254) || // link-local, cloud metadata
    (a === 172 && b >= 16 && b <= 31) ||
    (a === 192 && b === 168) ||
    (a === 192 && b === 0) || // IETF protocol assignments, TEST-NET-1
    (a === 198 && (b === 18 || b === 19)) || // benchmarking
    (a === 198 && b === 51) || // TEST-NET-2
    (a === 203 && b === 0) || // TEST-NET-3
    a >= 224 // multicast and reserved
  )
}

function isPrivateIpv6(address: string): boolean {
  const lowered = address.toLowerCase()
  if (lowered === '::' || lowered === '::1') return true
  // IPv4-mapped (::ffff:a.b.c.d, which the URL parser normalises to
  // ::ffff:hhhh:hhhh) inherits the IPv4 rule
  const dotted = /^::ffff:(\d+\.\d+\.\d+\.\d+)$/.exec(lowered)
  if (dotted != null) return isPrivateIpv4(dotted[1])
  const hex = /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/.exec(lowered)
  if (hex != null) {
    const high = parseInt(hex[1], 16)
    const low = parseInt(hex[2], 16)
    return isPrivateIpv4(
      `${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`
    )
  }
  return (
    lowered.startsWith('fc') || // unique local fc00::/7
    lowered.startsWith('fd') ||
    lowered.startsWith('fe8') || // link-local fe80::/10
    lowered.startsWith('fe9') ||
    lowered.startsWith('fea') ||
    lowered.startsWith('feb') ||
    lowered.startsWith('ff') // multicast
  )
}

/** The hostname of a parsed URL, with IPv6 brackets removed. */
function bareHostname(url: URL): string {
  const { hostname } = url
  return hostname.startsWith('[') ? hostname.slice(1, -1) : hostname
}

/**
 * Local development runs the journeys app on localhost, which the rule below
 * would refuse as a destination, so a QR code could never be created there.
 * The opt-in is read on each call so a test can flip it; it must never be
 * set in a deployed environment, where the health check reaches the VPC, so
 * `readShortLinksEnv` throws when it is set under `NODE_ENV=production`.
 */
function allowsLocalDestinations(): boolean {
  return readShortLinksEnv().SHORT_LINKS_ALLOW_LOCAL_DESTINATIONS === 'true'
}

export function isPublicHostname(hostname: string): boolean {
  const lowered = hostname.toLowerCase()
  if (lowered === '') return false
  if (allowsLocalDestinations()) return true
  if (LOCAL_HOSTNAMES.has(lowered)) return false
  if (LOCAL_SUFFIXES.some((suffix) => lowered.endsWith(suffix))) return false
  const version = isIP(lowered)
  if (version === 4) return !isPrivateIpv4(lowered)
  if (version === 6) return !isPrivateIpv6(lowered)
  return lowered.includes('.') // bare names resolve internally
}

function parsePublicUrl(value: string, protocols: string[]): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (!protocols.includes(url.protocol)) return false
  return isPublicHostname(bareHostname(url))
}

/** https, and a public hostname (see `isPublicHostname`): fallbacks and origins. */
export function isPublicHttpsUrl(value: string): boolean {
  return parsePublicUrl(value, ['https:'])
}

/** http or https, and a public hostname: a link destination (`to`). */
export function isPublicWebUrl(value: string): boolean {
  return parsePublicUrl(value, ['http:', 'https:'])
}
