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

export function buildShortUrl(
  domain: ShortUrlDomain,
  pathname: string
): string {
  const prefix = normalizePathPrefix(domain.pathPrefix ?? '')
  const path = prefix === '' ? pathname : `${prefix}/${pathname}`
  return `https://${domain.hostname}/${path}`
}

export function buildQrUrl(domain: ShortUrlDomain, pathname: string): string {
  return `${buildShortUrl(domain, pathname)}?qr=1`
}
