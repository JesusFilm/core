import { EnvironmentConfig } from './types'
import { readFileSync } from 'fs'

export const config: EnvironmentConfig = {
  production: false,
  gatewayConfig: {
    supergraphSdl: readFileSync(
      './apps/api-gateway/schema.graphql'
    ).toString()
  },
  listenOptions: {
    port: 4000,
    host: '0.0.0.0'
  }
}
