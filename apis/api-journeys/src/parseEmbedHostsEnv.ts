import { z } from 'zod'

/**
 * Parses the `TEMPLATE_LIBRARY_EMBED_HOSTS` env var — a JSON object mapping a
 * human-readable label (typically the service name) to a single allowed
 * hostname, one entry per host:
 *
 *   { "canva": "canva.com", "canvaWww": "www.canva.com", "youtube": "youtube.com" }
 *
 * Returns the set of hostnames (the object's values). The keys are labels for
 * ops readability only — the code matches incoming URLs on the hostname values.
 *
 * Each value is trimmed, lowercased, then verified to be a bare hostname with
 * no scheme, path, port, or query baked in. A non-object (e.g. an array),
 * malformed JSON, or any invalid value throws, which fails boot loudly.
 */
export function parseEmbedHostsEnv(value: string): ReadonlySet<string> {
  let parsed: unknown
  try {
    parsed = JSON.parse(value)
  } catch {
    throw new Error(
      'TEMPLATE_LIBRARY_EMBED_HOSTS must be a valid JSON object mapping a name to a hostname'
    )
  }

  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(
      'TEMPLATE_LIBRARY_EMBED_HOSTS must be a JSON object (e.g. {"canva":"canva.com"}), not an array or scalar'
    )
  }

  const entries = z.record(z.string(), z.string()).parse(parsed)
  const hosts = new Set<string>()
  for (const [name, rawHost] of Object.entries(entries)) {
    const host = rawHost.trim().toLowerCase()
    let url: URL
    try {
      url = new URL(`https://${host}`)
    } catch {
      throw new Error(
        `TEMPLATE_LIBRARY_EMBED_HOSTS["${name}"] is not a valid hostname: "${rawHost}"`
      )
    }
    // Reject a scheme, path, port, or query baked into the value: a bare
    // hostname round-trips through the URL parser with host === hostname === itself.
    if (url.hostname !== host || url.host !== host) {
      throw new Error(
        `TEMPLATE_LIBRARY_EMBED_HOSTS["${name}"] must be a bare hostname (no scheme, path, port, or query): "${rawHost}"`
      )
    }
    hosts.add(host)
  }
  return hosts
}
