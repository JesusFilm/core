import { defineConfig } from '@graphql-hive/gateway'

export const gatewayConfig = defineConfig({
  cors: false,
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
  }
})
