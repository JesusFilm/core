import { ShortLinkDomain } from '@core/prisma/media/client'

import { normalizePathPrefix } from '../lib/shortUrl'

/** `jesus.film` -> `KV_JESUS_FILM`: the Worker binding of a domain's namespace. */
export function kvBindingName(hostname: string): string {
  const suffix = hostname
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
  return `KV_${suffix}`
}

/** Bindings named `KV_*` are owned by api-media; wrangler.toml owns the rest. */
export function isOwnedBindingName(name: string): boolean {
  return /^KV_[A-Z0-9_]+$/.test(name)
}

/**
 * The namespace title carries the Worker name and the hostname verbatim, so
 * stage and prod never share a namespace and two hostnames never collide.
 */
export function namespaceTitle(workerName: string, hostname: string): string {
  return `${workerName}:${hostname.toLowerCase()}`
}

export type AttachmentTarget =
  | { kind: 'customDomain'; hostname: string; pattern: string }
  | { kind: 'route'; hostname: string; pattern: string }

/**
 * How a domain reaches the Worker. A domain at the root of its hostname is a
 * Workers Custom Domain (Cloudflare creates its DNS record and certificate). A
 * domain under a path prefix is a zone route, so the rest of the hostname
 * stays free: `jesus.film` + `s` -> `jesus.film/s/*`.
 */
export function attachmentTarget(
  domain: Pick<ShortLinkDomain, 'hostname' | 'pathPrefix'>
): AttachmentTarget {
  const hostname = domain.hostname.toLowerCase()
  const prefix = normalizePathPrefix(domain.pathPrefix ?? '')
  return prefix === ''
    ? { kind: 'customDomain', hostname, pattern: hostname }
    : { kind: 'route', hostname, pattern: `${hostname}/${prefix}/*` }
}
