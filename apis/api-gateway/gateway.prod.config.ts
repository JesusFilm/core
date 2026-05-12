import { createOtlpGrpcExporter, defineConfig } from '@graphql-hive/gateway'

import { commonConfig } from './src/common.config'

/**
 * Resolves the set of dev hostnames that should opt into the dev-only
 * CORS relaxation. Reads `DEV_HOSTS` (no `NEXT_PUBLIC_` prefix — this is
 * server-side, the gateway never ships its env to the browser) and parses
 * it as a JSON object whose values are the FQDNs to allow, e.g.
 *
 *   { "siyang": "tailscale-dev-siyang.taila2a609.ts.net" }
 *
 * Populated from Doppler's dev config; absent in stage/prod, so this
 * returns `[]` everywhere outside dev. Absence of the secret IS the gate.
 * Fail-closed on missing, empty, malformed JSON, `null`, or non-object
 * payloads. See docs/development/tailscale-dev-access.md.
 */
function getDevHosts(): string[] {
  const raw = process.env.DEV_HOSTS
  if (raw == null || raw === '') return []
  try {
    const parsed: unknown = JSON.parse(raw)
    if (parsed === null || typeof parsed !== 'object') return []
    return Object.values(parsed as Record<string, unknown>).filter(
      (v): v is string => typeof v === 'string'
    )
  } catch {
    return []
  }
}

// configuration specific to stage and production
export const gatewayConfig = defineConfig({
  ...commonConfig,
  supergraph: {
    type: 'hive',
    endpoint: process.env.HIVE_CDN_ENDPOINT ?? '',
    key: process.env.HIVE_CDN_KEY ?? ''
  },
  // Poll Hive CDN for supergraph updates without restart
  pollingInterval: 10_000,
  openTelemetry: {
    exporters: [
      createOtlpGrpcExporter({
        url: 'http://0.0.0.0:4317'
      })
    ],
    serviceName: 'api-gateway'
  },
  cors(request) {
    const origin = request.headers.get('Origin') ?? ''
    const defaultCors: Parameters<typeof defineConfig>[0]['cors'] = {
      origin: 'https://api-gateway.central.jesusfilm.org/',
      methods: ['GET', 'POST', 'OPTIONS'],
      maxAge: 86400
    }

    // Build one regex per allow-listed dev host. The dev servers run on
    // :4100 / :4200, so the browser will send `Origin:
    // http://<fqdn>:<port>` — the optional `(:\d+)?` group covers that.
    // Empty `DEV_HOSTS` → empty array → no relaxation; absence of the
    // secret IS the gate.
    const devHostRegexes = getDevHosts().map((host) => {
      const escaped = host.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return new RegExp(`^http:\\/\\/${escaped}(:\\d+)?$`, 'i')
    })

    const matchers: Array<string | RegExp> = [
      // gateway
      'https://api-gateway.central.jesusfilm.org',
      'https://api-gateway.stage.central.jesusfilm.org',
      // apollo studio
      'https://studio.apollographql.com',
      // graphql hive
      'https://app.graphql-hive.com',
      // journeys-admin
      'https://admin.nextstep.is',
      'https://admin-stage.nextstep.is',
      // journeys
      'https://your.nextstep.is',
      'https://your-stage.nextstep.is',
      // nexus-admin
      'https://nexus.jesusfilm.org',
      'https://nexus-stage.jesusfilm.org',
      // any localhost
      /^http:\/\/localhost:\d+$/,
      // any project deployed on the jesusfilm vercel account
      /^https:\/\/([a-z0-9-]+)-jesusfilm[.]vercel[.]app$/,
      // any project deployed on the jesusfilm.org domain (used primarily for watch)
      /^https:\/\/([a-z0-9-]+)[.]jesusfilm[.]org$/,
      // dev-only: hostnames listed in `DEV_HOSTS` (Doppler dev config) so
      // cross-device dev testing works without per-developer regex
      // fiddling. HTTP-only (Tailnet traffic is unencrypted by default;
      // Funnel HTTPS is a separate opt-in we don't widen for here). See
      // docs/development/tailscale-dev-access.md.
      ...devHostRegexes
    ]

    if (
      matchers.some((matcher) =>
        typeof matcher === 'string' ? matcher === origin : matcher.test(origin)
      )
    )
      return {
        ...defaultCors,
        origin
      }

    return defaultCors
  },
  graphiql: {
    title: `[${process.env.SERVICE_ENV?.toUpperCase() ?? 'PROD'}] api-gateway`
  }
})
