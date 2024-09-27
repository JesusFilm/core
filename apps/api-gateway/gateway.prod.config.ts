import { createOtlpHttpExporter, defineConfig } from '@graphql-hive/gateway'

export const gatewayConfig = defineConfig({
  port: 4000,
  graphqlEndpoint: '/',
  healthCheckEndpoint: '/health',
  supergraph: {
    type: 'hive',
    endpoint: process.env.HIVE_CDN_ENDPOINT!,
    key: process.env.HIVE_CDN_KEY!
  },
  propagateHeaders: {
    fromClientToSubgraphs: ({ request }) => {
      return {
        authorization: request.headers.get('authorization') ?? '',
        'user-agent': request.headers.get('user-agent') ?? '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        'interop-token': request.headers.get('interop-token') ?? ''
      }
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
    const defaultCors = {
      origin: 'https://api-gateway.central.jesusfilm.org/',
      allowedHeaders: [
        'content-type',
        'authorization',
        'apollographql-client-name',
        'user-agent'
      ],
      credentials: true,
      methods: ['POST']
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
  }
})
