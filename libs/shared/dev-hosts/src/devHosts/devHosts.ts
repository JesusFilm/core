/**
 * Resolves the set of dev hostnames that opt into dev-only relaxations
 * (proxy rewrite, Apollo gateway URL derivation, redirect allow-list, QR-code
 * short-link host swap, Next.js `allowedDevOrigins`, gateway CORS).
 *
 * Sourced from `NEXT_PUBLIC_DEV_HOSTS` (browser, NEXT_PUBLIC_ prefix bundles it
 * into the JS) or `DEV_HOSTS` (server-side, no NEXT_PUBLIC_ prefix). The
 * fallback chain lets the same helper work in browser bundles AND server-side
 * gateway code — Doppler can use whichever name fits per project.
 *
 * Fail-closed: missing var, empty string, malformed JSON, `null`, or a
 * non-object payload all yield `[]`. Absence of the secret IS the gate; no
 * `NODE_ENV` checks needed. Callers that need localhost support handle it
 * independently (e.g. via a strict allow-list or hardcoded fallback) — this
 * helper is Doppler-only.
 *
 * The extra `typeof parsed !== 'object'` guard prevents the
 * `Object.values("hello") === ["h","e","l","l","o"]` footgun when the var
 * contains a JSON-encoded string literal.
 */
export function getDevHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_DEV_HOSTS ?? process.env.DEV_HOSTS
  if (raw == null || raw === '') return []
  try {
    const parsed: unknown = JSON.parse(raw)
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
