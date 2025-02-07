import { defineConfig } from '@graphql-hive/gateway'

import { commonConfig } from './src/common.config'

// configuration specific to development
export const gatewayConfig = defineConfig({
  ...commonConfig,
  supergraph: './api/api-gateway/schema.graphql',
  graphiql: {
    title: '[DEV] api-gateway'
  }
})
