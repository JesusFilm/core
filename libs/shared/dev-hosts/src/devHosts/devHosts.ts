/**
 * Hostnames always treated as dev hosts. `localhost` and `127.0.0.1` are
 * implicit dev hosts (the default `pnpm dev` shape) — they don't need to
 * be listed in `NEXT_PUBLIC_DEV_HOSTS` / `DEV_HOSTS` for the helpers to
 * recognise them.
 */
const LOCAL_DEV_HOSTS: readonly string[] = ['localhost', '127.0.0.1']

/**
 * Resolves the set of dev hostnames that should opt into dev-only relaxations
 * (proxy rewrite, Apollo gateway URL derivation, redirect allow-list, QR-code
 * short-link host swap, Next.js `allowedDevOrigins`).
 *
 * Reads `NEXT_PUBLIC_DEV_HOSTS` first (browser-bundled when set via Doppler's
 * dev config), falling back to `DEV_HOSTS` (plain server-side var). The
 * fallback chain lets the same helper work in browser bundles AND server-side
 * code — Doppler can use whichever name fits per project.
 *
 * `localhost` and `127.0.0.1` are always included; everything else comes from
 * the env-var allow-list. Missing var, empty string, malformed JSON, `null`,
 * or a non-object payload all yield the LOCAL_DEV_HOSTS baseline (no extra
 * relaxation beyond the implicit locals). For non-localhost dev hosts,
 * absence of the secret IS the gate; no `NODE_ENV` check is needed.
 *
 * The extra `typeof parsed !== 'object'` guard prevents the
 * `Object.values("hello") === ["h","e","l","l","o"]` footgun when the var
 * contains a JSON-encoded string literal.
 *
 * See docs/development/tailscale-dev-access.md.
 */
export function getDevHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_DEV_HOSTS ?? process.env.DEV_HOSTS
  if (raw == null || raw === '') return [...LOCAL_DEV_HOSTS]
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object')
      return [...LOCAL_DEV_HOSTS]
    return [
      ...LOCAL_DEV_HOSTS,
      ...Object.values(parsed).filter(
        (v): v is string => typeof v === 'string'
      )
    ]
  } catch {
    return [...LOCAL_DEV_HOSTS]
  }
}

export function isDevHost(host: string): boolean {
  return getDevHosts().includes(host)
}
