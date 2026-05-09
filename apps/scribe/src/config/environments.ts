export type EnvironmentId = 'dev' | 'stage' | 'prod'

export interface EnvironmentConfig {
  id: EnvironmentId
  label: string
  gatewayUrl: string
  journeysAdminUrl: string
}

const ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  dev: {
    id: 'dev',
    label: 'Development (localhost)',
    gatewayUrl: 'http://localhost:4000/',
    journeysAdminUrl: 'http://localhost:4200'
  },
  stage: {
    id: 'stage',
    label: 'Staging',
    gatewayUrl: 'https://api-gateway.stage.central.jesusfilm.org/',
    journeysAdminUrl: 'https://admin-stage.nextstep.is'
  },
  prod: {
    id: 'prod',
    label: 'Production',
    gatewayUrl: 'https://api-gateway.central.jesusfilm.org/',
    journeysAdminUrl: 'https://admin.nextstep.is'
  }
}

export function getEnvironment(id: EnvironmentId): EnvironmentConfig {
  return ENVIRONMENTS[id]
}

export function listEnvironments(): EnvironmentConfig[] {
  return Object.values(ENVIRONMENTS)
}

export function isEnvironmentId(value: string): value is EnvironmentId {
  return value === 'dev' || value === 'stage' || value === 'prod'
}
