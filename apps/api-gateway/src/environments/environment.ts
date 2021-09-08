import { EnvironmentConfig } from './types'
import { readFileSync } from 'fs'

export const config: EnvironmentConfig = {
  production: false,
  gatewayConfig: {
    supergraphSdl: readFileSync('./apps/api-gateway/schema.graphql').toString()
  }
}
