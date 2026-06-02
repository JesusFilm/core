import { GraphQLError } from 'graphql'

import { prisma as prismaMedia } from '@core/prisma/media/client'

import { env } from '../../../env'
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
  allowedHosts ??= new Set(env.TEMPLATE_LIBRARY_EMBED_HOSTS)
  return allowedHosts
}

/**
 * Validates and normalizes a pasted embed URL into a stored iframe `embedUrl`.
 *
 * Order of operations:
 *  1. `assertHttpsUrl` — reject non-https before any host logic.
 *  2. Blocklist gate — reuse `ShortLinkBlocklistDomain`. Runs first and applies
 *     to ALL hosts so security can kill an embed source with a manual INSERT,
 *     no deploy.
 *  3. Allowlist gate — host must be in the env-owned TEMPLATE_LIBRARY_EMBED_HOSTS
 *     set.
 *  4. Normalizer lookup (NOT a gate) — providers with a normalizer get
 *     provider-specific handling; everything else is stored as-is.
 */
export async function linkValidate(url: string): Promise<{ embedUrl: string }> {
  assertHttpsUrl(url, 'url')
  const hostname = new URL(url).hostname.toLowerCase()

  // Deliberate direct cross-DB read (not via the gateway): matches the only
  // existing consumer of this table — shortLink.ts's `findFirst({ where:
  // { hostname } })` — and the cross-DB read precedent in lib/mediaCleanup.
  // Exact-hostname match by design, same as shortLink; the env allowlist is the
  // primary control and a kill-switch INSERT here also disables short-links for
  // the host (shared kill-switch surface).
  const blocked = await prismaMedia.shortLinkBlocklistDomain.findFirst({
    where: { hostname }
  })
  if (blocked != null) {
    throw new GraphQLError('This host is blocked and cannot be embedded.', {
      extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_BLOCKED' }
    })
  }

  if (!getAllowedHosts().has(hostname)) {
    throw new GraphQLError('This host is not allowed to be embedded.', {
      extensions: { code: 'BAD_USER_INPUT', reason: 'EMBED_HOST_NOT_ALLOWED' }
    })
  }

  const spec = NORMALIZERS.get(hostname)
  if (spec == null) return { embedUrl: url }
  return await spec.normalize(url)
}
