import { defineConfig } from '@graphql-hive/gateway'

import { commonConfig } from './src/common.config'

// configuration specific to development
export const gatewayConfig = defineConfig({
  ...commonConfig,
  supergraph: './apis/api-gateway/schema.graphql',
  // Poll for supergraph changes in development so we don't need restarts
  pollingInterval: 5_000,
  graphiql: {
    title: '[DEV] api-gateway'
  }
})
