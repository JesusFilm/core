import {
  createOtlpHttpExporter,
  createRemoteJwksSigningKeyProvider,
  defineConfig
} from '@graphql-hive/gateway'
import pino, { Logger } from 'pino'

export const logger = pino({
  formatters: {
    level(level) {
      return { level }
    }
  }
}).child({ service: 'api-gateway' })

const googleApplication = JSON.parse(
  process.env.GOOGLE_APPLICATION_JSON ?? '{}'
)

function childFn(logger: Logger) {
  return (name: string) => {
    const child = logger.child({ name })
    return { ...child, log: child.info, child: childFn(child) }
  }
}

export const gatewayConfig = defineConfig({
  logging: { ...logger, log: logger.info, child: childFn(logger) },
  port: 4000,
  graphqlEndpoint: '/',
  healthCheckEndpoint: '/health',
  supergraph: {
    type: 'hive',
    endpoint: process.env.HIVE_CDN_ENDPOINT ?? '',
    key: process.env.HIVE_CDN_KEY ?? ''
  },
  propagateHeaders: {
    fromClientToSubgraphs: ({ request, subgraphName }) => {
      const headers: Record<string, string> = {
        'user-agent': request.headers.get('user-agent') ?? '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        'interop-token': request.headers.get('interop-token') ?? ''
      }
      if (subgraphName === 'analytics')
        headers.authorization = request.headers.get('authorization') ?? ''

      return headers
    }
  },
  openTelemetry: {
    exporters: [
      createOtlpHttpExporter({
        url: `http://${process.env.DD_OTLP_CONFIG_RECEIVER_PROTOCOLS_HTTP_ENDPOINT}`
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

    if (
      [
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
        /^https:\/\/([a-z0-9-]+)[.]jesusfilm[.]org$/
      ].some((matcher) =>
        typeof matcher === 'string' ? matcher === origin : matcher.test(origin)
      )
    )
      return {
        ...defaultCors,
        origin
      }

    return defaultCors
  },
  hmacSignature: {
    secret: process.env.GATEWAY_HMAC_SECRET ?? ''
  },
  jwt: {
    tokenLookupLocations: [
      ({ request }) => {
        const header = request.headers.get('authorization')

        if (header == null) return

        const [prefix, token] = header.split(' ').map((s) => s.trim())

        if (prefix !== 'JWT') return

        return { prefix, token }
      }
    ],
    singingKeyProviders: [
      createRemoteJwksSigningKeyProvider({
        jwksUri:
          'https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com'
      })
    ],
    tokenVerification: {
      issuer: `https://securetoken.google.com/${googleApplication.project_id}`,
      audience: googleApplication.project_id,
      algorithms: ['RS256']
    },
    forward: {
      payload: true
    },
    reject: {
      missingToken: false
    }
  }
})
