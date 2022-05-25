import { GatewayConfig } from '@apollo/gateway'
import { CorsOptions } from 'apollo-server'

export interface EnvironmentConfig {
  production: boolean
  gatewayConfig: GatewayConfig
  listenOptions?: {
    port?: number
    host?: string
    backlog?: number
    path?: string
    exclusive?: boolean
    readableAll?: boolean
    writableAll?: boolean
    ipv6Only?: boolean
  }
  cors?: CorsOptions | boolean
}
