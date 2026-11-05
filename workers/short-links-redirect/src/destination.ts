/** Query parameters the short URL consumes itself and never forwards. */
const STRIPPED_PARAMS: ReadonlySet<string> = new Set(['qr'])

/**
 * Builds the redirect destination: the routing record's `to` with every
 * incoming query parameter appended except `qr`. The destination's own
 * parameters are kept, duplicates are appended rather than overwritten, and a
 * hash fragment on `to` survives.
 *
 * Throws when `to` is not an absolute URL; callers decide the fallback.
 */
export function buildDestination(
  to: string,
  incomingSearchParams: URLSearchParams
): string {
  const destination = new URL(to)
  for (const [name, value] of incomingSearchParams) {
    if (STRIPPED_PARAMS.has(name)) continue
    destination.searchParams.append(name, value)
  }
  return destination.toString()
}
