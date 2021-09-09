import { GatewayConfig } from '@apollo/gateway'

export interface EnvironmentConfig {
  production: boolean
  gatewayConfig: GatewayConfig
}
