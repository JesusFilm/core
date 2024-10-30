import { createOtlpGrpcExporter, defineConfig } from '@graphql-hive/gateway'

import { commonConfig } from './src/common.config'

// configuration specific to stage and production
export const gatewayConfig = defineConfig({
  ...commonConfig,
  supergraph: {
    type: 'hive',
    endpoint: process.env.HIVE_CDN_ENDPOINT ?? '',
    key: process.env.HIVE_CDN_KEY ?? ''
  },
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
  graphiql: {
    title: `[${process.env.SERVICE_ENV?.toUpperCase() ?? 'PROD'}] api-gateway`
  }
})
