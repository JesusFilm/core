/**
 * The one place a short URL is built. A domain may serve its links under a
 * path prefix (`https://jesus.film/s/<pathname>`); an empty prefix keeps them
 * at the root of the hostname. Edge keys never contain the prefix.
 */

export interface ShortUrlDomain {
  hostname: string
  pathPrefix?: string | null
}

export const PATH_PREFIX_PATTERN = /^[A-Za-z0-9_-]+(\/[A-Za-z0-9_-]+)*$/

export const PATH_PREFIX_MESSAGE =
  'pathPrefix must be empty or path segments of letters, numbers, dashes or underscores (e.g. s)'

/** Trim whitespace and leading/trailing slashes: '/s/' -> 's'. */
export function normalizePathPrefix(pathPrefix: string): string {
  return pathPrefix.trim().replace(/^\/+|\/+$/g, '')
}

/** Validates an already-normalised prefix. */
export function isValidPathPrefix(pathPrefix: string): boolean {
  return pathPrefix === '' || PATH_PREFIX_PATTERN.test(pathPrefix)
}

/**
 * Where a domain's links are served from: `https://<hostname>`, except in
 * local dev. When edge publishing points at a local redirect Worker
 * (`CLOUDFLARE_SHORT_LINKS_API_BASE_URL`, e.g.
 * `http://localhost:8788/client/v4`), the domain with that Worker's hostname is
 * served from the Worker's own origin, so its short URLs carry the scheme and
 * port that actually answer.
 */
function shortUrlOrigin(hostname: string): string {
  const localWorkerUrl = process.env.CLOUDFLARE_SHORT_LINKS_API_BASE_URL
  if (localWorkerUrl == null || !URL.canParse(localWorkerUrl))
    return `https://${hostname}`

  const localWorker = new URL(localWorkerUrl)
  return localWorker.hostname === hostname.toLowerCase()
    ? localWorker.origin
    : `https://${hostname}`
}

export function buildShortUrl(
  domain: ShortUrlDomain,
  pathname: string
): string {
  const prefix = normalizePathPrefix(domain.pathPrefix ?? '')
  const path = prefix === '' ? pathname : `${prefix}/${pathname}`
  return `${shortUrlOrigin(domain.hostname)}/${path}`
}

export function buildQrUrl(domain: ShortUrlDomain, pathname: string): string {
  return `${buildShortUrl(domain, pathname)}?qr=1`
}
