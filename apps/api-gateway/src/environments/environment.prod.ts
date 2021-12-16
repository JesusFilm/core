import { EnvironmentConfig } from './types'
import { readFileSync } from 'fs'

export const config: EnvironmentConfig = {
  production: true,
  gatewayConfig: {
    supergraphSdl: readFileSync(
      './schema.graphql'
    ).toString()
  },
  listenOptions: {
    port: 4000,
    host: '0.0.0.0'
  }
}
