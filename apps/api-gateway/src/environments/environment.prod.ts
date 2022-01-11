import { readFileSync } from 'fs'
import { EnvironmentConfig } from './types'

export const config: EnvironmentConfig = {
  production: true,
  gatewayConfig: {
    supergraphSdl: readFileSync('./schema.graphql').toString()
  },
  listenOptions: {
    port: 4000,
    host: '0.0.0.0'
  }
}
