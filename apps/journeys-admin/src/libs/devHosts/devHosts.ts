/**
 * Resolves the set of dev hostnames that should opt into dev-only relaxations
 * (proxy rewrite, Apollo gateway URL derivation, redirect allow-list, QR-code
 * short-link host swap, Next.js `allowedDevOrigins`, gateway CORS).
 *
 * Sourced from `NEXT_PUBLIC_DEV_HOSTS` — a JSON object whose values are the
 * FQDNs to allow, e.g. `{"siyang":"tailscale-dev-siyang.taila2a609.ts.net"}`.
 * Populated from Doppler's dev config; absent in stage/prod, so the helper
 * returns `[]` everywhere outside dev. Absence of the secret IS the gate; no
 * `NODE_ENV` check is needed.
 *
 * Fail-closed: missing var, empty string, malformed JSON, `null`, or a
 * non-object payload all yield `[]` (no relaxation).
 *
 * The extra `typeof parsed !== 'object'` guard prevents the
 * `Object.values("hello") === ["h","e","l","l","o"]` footgun when the var
 * contains a JSON-encoded string literal.
 *
 * See docs/development/tailscale-dev-access.md.
 */
export function getDevHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_DEV_HOSTS
  if (raw == null || raw === '') return []
  try {
    const parsed = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return []
    return Object.values(parsed).filter(
      (v): v is string => typeof v === 'string'
    )
  } catch {
    return []
  }
}

export function isDevHost(host: string): boolean {
  return getDevHosts().includes(host)
}
