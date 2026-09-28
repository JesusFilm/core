/**
 * Where this app is mounted: https://jesus.film/s/dashboard. Must equal
 * `basePath` in next.config.js (basePath.spec.ts asserts they agree).
 *
 * Next.js prefixes <Link>, router navigation and its own assets, and strips
 * the base path before the proxy and route matching. It does NOT prefix
 * `fetch()` calls to this app's own /api routes, plain hrefs or image URLs
 * built from strings: wrap those with `withBasePath`.
 */
export const BASE_PATH = '/s/dashboard'

export function withBasePath(path: string): string {
  if (/^[a-z][a-z0-9+.-]*:/i.test(path) || path.startsWith('//')) return path

  const normalized = path.startsWith('/') ? path : `/${path}`
  if (normalized === BASE_PATH || normalized.startsWith(`${BASE_PATH}/`))
    return normalized
  if (normalized === '/') return BASE_PATH

  return `${BASE_PATH}${normalized}`
}
