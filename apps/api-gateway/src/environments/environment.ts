import { readFileSync } from 'fs'
import { EnvironmentConfig } from './types'

export const config: EnvironmentConfig = {
  production: false,
  gatewayConfig: {
    supergraphSdl: readFileSync('./apps/api-gateway/schema.graphql').toString()
  },
  listenOptions: {
    port: 4000,
    host: '0.0.0.0'
  },
  cors: {
    maxAge: 86400, // 24 hours in seconds
    origin: '*'
  }
}
