import { KNOWN_EMBED_HOSTS } from './embedAttrs'

/**
 * Parses the `TEMPLATE_LIBRARY_EMBED_HOSTS` env value — the SAME Doppler
 * secret the API consumes — into a set of allowed hostnames. The value is a
 * JSON object mapping a human-readable label to a single bare hostname:
 *
 *   { "canva": "canva.com", "youtube": "youtube-nocookie.com" }
 *
 * Mirrors `apis/api-journeys/src/parseEmbedHostsEnv.ts` so the one
 * Doppler value parses identically on both sides. The two should eventually
 * share one module in a common lib; until then keep the JSON shape in lockstep.
 *
 * Unlike the API parser (which throws to fail boot loudly on a bad value),
 * this is fail-CLOSED: a missing, empty, or malformed value yields `null`, and
 * the caller falls back to `KNOWN_EMBED_HOSTS`. A public page must never crash
 * on an ops typo, and the API already fails its own boot on a malformed value,
 * so a bad value is caught upstream before it can reach here.
 */
export function parseEmbedHostsEnv(
  value: string | undefined
): ReadonlySet<string> | null {
  if (value == null || value.trim() === '') return null

  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    return null
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return null
  }

  const hosts = new Set<string>()
  for (const rawHost of Object.values(parsed as Record<string, unknown>)) {
    if (typeof rawHost !== 'string') return null
    const host = rawHost.trim().toLowerCase()
    // A bare hostname round-trips through the URL parser with
    // host === hostname === itself; reject anything carrying a scheme, path,
    // port, or query.
    try {
      const url = new URL(`https://${host}`)
      if (url.hostname !== host || url.host !== host) return null
    } catch {
      return null
    }
    hosts.add(host)
  }
  return hosts
}

/**
 * Resolves the effective embed-host allowlist: the env-driven list when
 * present, otherwise the built-in `KNOWN_EMBED_HOSTS`. Reading `process.env`
 * here keeps the value server-side (no `NEXT_PUBLIC_` prefix), so a Doppler
 * change takes effect at runtime without a frontend rebuild. Call from a
 * server context (e.g. `getServerSideProps`).
 */
export function resolveEmbedHosts(
  envValue: string | undefined
): ReadonlySet<string> {
  return parseEmbedHostsEnv(envValue) ?? KNOWN_EMBED_HOSTS
}

/**
 * Defense-in-depth host gate for the public page: an embed URL is renderable
 * only when it is a parseable https URL whose host is in `allowedHosts`. The
 * API normalizes and allowlists at save time; this independently re-checks at
 * read time so a stored off-allowlist or non-https URL never reaches an
 * iframe, even if the API regresses.
 */
export function isEmbedUrlAllowed(
  embedUrl: string,
  allowedHosts: ReadonlySet<string>
): boolean {
  let url: URL
  try {
    url = new URL(embedUrl)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  return allowedHosts.has(url.hostname.toLowerCase())
}
