import {
  createRemoteJwksSigningKeyProvider,
  defineConfig
} from '@graphql-hive/gateway'

const googleApplication = JSON.parse(
  process.env.GOOGLE_APPLICATION_JSON ?? '{}'
)

export const gatewayConfig = defineConfig({
  port: 4000,
  healthCheckEndpoint: '/health',
  graphqlEndpoint: '/',
  supergraph: './apps/api-gateway/schema.graphql',
  propagateHeaders: {
    fromClientToSubgraphs: ({ request }) => {
      return {
        authorization: request.headers.get('authorization') ?? '',
        'user-agent': request.headers.get('user-agent') ?? '',
        'x-forward-for': request.headers.get('x-forward-for') ?? '',
        'interop-token': request.headers.get('interop-token') ?? ''
      }
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
