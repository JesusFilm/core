import { defineConfig } from '@graphql-hive/gateway'

import { commonConfig } from './gateway.prod.config'

// configuration specific to development
export const gatewayConfig = defineConfig({
  ...commonConfig,
  supergraph: './apps/api-gateway/schema.graphql',
  graphiql: {
    title: '[DEV] api-gateway'
  }
})
