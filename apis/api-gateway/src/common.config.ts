import {
  createRemoteJwksSigningKeyProvider,
  defineConfig
} from '@graphql-hive/gateway'

import logger from './logger'

const googleApplication = JSON.parse(
  process.env.GOOGLE_APPLICATION_JSON ?? '{}'
)

export const commonConfig = defineConfig({
  logging: logger,
  port: 4000,
  graphqlEndpoint: '/',
  healthCheckEndpoint: '/readiness',
  propagateHeaders: {
    fromClientToSubgraphs: ({ request, subgraphName }) => {
      const headers: Record<string, string> = {
        'user-agent': request.headers.get('user-agent') ?? '',
        'x-forwarded-for': request.headers.get('x-forwarded-for') ?? '',
        'x-graphql-client-name':
          request.headers.get('x-graphql-client-name') ?? '',
        'interop-token': request.headers.get('interop-token') ?? ''
      }
      if (subgraphName === 'api-analytics')
        headers.authorization = request.headers.get('authorization') ?? ''

      return headers
    }
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
