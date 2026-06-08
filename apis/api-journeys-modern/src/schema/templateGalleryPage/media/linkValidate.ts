import { GraphQLError } from 'graphql'

import { env } from '../../../env'
import { logger } from '../../logger'
import { assertHttpsUrl } from '../assertHttpsUrl'

import { canvaSpec } from './canvaOEmbed'
import { googleSlidesSpec } from './googleSlidesValidate'
import { EmbedNormalizerSpec } from './types'
import { youTubeSpec } from './youTubeOEmbed'

// The single source of truth for which providers need URL-specific handling.
// The normalizer dispatch table is derived from this array, so a provider's
// host list can never drift from its handler. NOTE: these hosts are NOT
// auto-allowlisted — the allowlist is owned entirely by the env var (see
// getAllowedHosts). A provider's hosts must also appear in
// TEMPLATE_LIBRARY_EMBED_HOSTS for its URLs to pass the allowlist gate.
const SPECS: ReadonlyArray<EmbedNormalizerSpec> = [
  canvaSpec,
  youTubeSpec,
  googleSlidesSpec
]

// host → spec (not host → normalize): dispatching through the spec object means
// the handler is resolved at call time, which keeps the specs independently
// testable via `vi.spyOn(spec, 'normalize')`.
const NORMALIZERS = new Map<string, EmbedNormalizerSpec>(
  SPECS.flatMap((spec) => spec.hosts.map((host) => [host, spec] as const))
)

// The embed allowlist is a SINGLE list sourced entirely from the Doppler env
// var TEMPLATE_LIBRARY_EMBED_HOSTS — there is no code-default seeding. Ops owns
// the full list (including the provider hosts canva.com / youtube.com /
// docs.google.com that the normalizers expect), and can add or remove a host
// without a deploy. Consequence: if the env list is empty or omits a provider
// host, that host is rejected even when a normalizer exists for it.
//
// Computed lazily on first use (and cached) rather than at module load: env is
// fixed at process start, so the result is identical to a boot-time read, but
// deferring the `env` read keeps schema-importing specs from having to fully
// mock env just because this module sits in the import graph.
let allowedHosts: ReadonlySet<string> | null = null
function getAllowedHosts(): ReadonlySet<string> {
  if (allowedHosts == null) {
    allowedHosts = new Set(env.TEMPLATE_LIBRARY_EMBED_HOSTS)
    warnOnNormalizerDrift(allowedHosts)
  }
  return allowedHosts
}

// Normalizer hosts that are NOT in the given allowlist. Each such host rejects
// every URL for it even though provider-specific handling exists — a silent
// divergence (e.g. ops allowlists `youtube.com` but omits `youtu.be`). Exported
// for tests; consumed by warnOnNormalizerDrift.
export function normalizerHostsMissingFrom(
  allowed: ReadonlySet<string>
): string[] {
  return [...NORMALIZERS.keys()].filter((host) => !allowed.has(host))
}

// Warn once, on the first allowlist read, rather than fail: removing a provider
// host from the list is also the intended way to disable that provider without
// a deploy, so this must not crash boot.
function warnOnNormalizerDrift(allowed: ReadonlySet<string>): void {
  const missing = normalizerHostsMissingFrom(allowed)
  if (missing.length > 0) {
    logger.warn(
      { missingHosts: missing },
      'normalizer hosts absent from TEMPLATE_LIBRARY_EMBED_HOSTS — URLs for these hosts will reject despite having a normalizer'
    )
  }
}

/**
 * Validates and normalizes a pasted embed URL into a stored iframe `embedUrl`.
 *
 * Order of operations:
 *  1. `assertHttpsUrl` — reject non-https before any host logic.
 *  2. Allowlist gate — host must be in the env-owned TEMPLATE_LIBRARY_EMBED_HOSTS
 *     set. This is the single authoritative control: to disable a host, remove
 *     it from the Doppler list (no deploy).
 *  3. Normalizer lookup (NOT a gate) — providers with a normalizer get
 *     provider-specific handling; everything else is stored as-is.
 */
export async function linkValidate(url: string): Promise<{ embedUrl: string }> {
  assertHttpsUrl(url, 'url')
  const hostname = new URL(url).hostname.toLowerCase()

  if (!getAllowedHosts().has(hostname)) {
    throw new GraphQLError('This host is not allowed to be embedded.', {
      extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_NOT_ALLOWED' }
    })
  }

  const spec = NORMALIZERS.get(hostname)
  if (spec == null) return { embedUrl: url }
  return await spec.normalize(url)
}
