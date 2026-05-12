/**
 * Matches a Tailscale MagicDNS host (lowercase letters, digits, hyphens, optional port).
 * No dots — so `tailscale-evil.attacker.com` cannot smuggle through.
 *
 * Mirrors the shape of the gateway CORS regex in api-gateway/gateway.prod.config.ts.
 */
export const TAILSCALE_HOST_PATTERN = /^tailscale-[a-z0-9-]+(:\d+)?$/i
