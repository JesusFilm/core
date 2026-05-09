export type EnvironmentId = 'dev' | 'stage' | 'prod'

export interface EnvironmentConfig {
  id: EnvironmentId
  label: string
  gatewayUrl: string
  journeysAdminUrl: string
  /**
   * Public Firebase web API key for this environment. Used by /impersonate
   * to exchange the custom token returned by `userImpersonate` for a real
   * ID token via the Firebase identity toolkit REST API. Same value as
   * `NEXT_PUBLIC_FIREBASE_API_KEY` in the journeys-admin .env. `null` here
   * means the value is sourced from the SCRIBE_FIREBASE_API_KEY_<ENV>
   * environment variable at runtime — see resolveFirebaseApiKey below.
   */
  firebaseApiKey: string | null
}

const ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  dev: {
    id: 'dev',
    label: 'Development (localhost)',
    gatewayUrl: 'http://localhost:4000/',
    journeysAdminUrl: 'http://localhost:4200',
    firebaseApiKey: null
  },
  stage: {
    id: 'stage',
    label: 'Staging',
    gatewayUrl: 'https://api-gateway.stage.central.jesusfilm.org/',
    journeysAdminUrl: 'https://admin-stage.nextstep.is',
    firebaseApiKey: null
  },
  prod: {
    id: 'prod',
    label: 'Production',
    gatewayUrl: 'https://api-gateway.central.jesusfilm.org/',
    journeysAdminUrl: 'https://admin.nextstep.is',
    firebaseApiKey: null
  }
}

export function getEnvironment(id: EnvironmentId): EnvironmentConfig {
  return ENVIRONMENTS[id]
}

/**
 * Resolve the Firebase web API key for an environment. Prefers the runtime
 * env var SCRIBE_FIREBASE_API_KEY_<ENV>, falling back to the static config.
 * Returns null if neither is set — /impersonate handles that gracefully.
 */
export function resolveFirebaseApiKey(env: EnvironmentConfig): string | null {
  const fromEnv = process.env[`SCRIBE_FIREBASE_API_KEY_${env.id.toUpperCase()}`]
  if (fromEnv != null && fromEnv.length > 0) return fromEnv
  return env.firebaseApiKey
}

export function listEnvironments(): EnvironmentConfig[] {
  return Object.values(ENVIRONMENTS)
}

export function isEnvironmentId(value: string): value is EnvironmentId {
  return value === 'dev' || value === 'stage' || value === 'prod'
}
