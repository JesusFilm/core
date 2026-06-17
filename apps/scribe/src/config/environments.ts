import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

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

const DOPPLER_CONFIG_BY_ENV: Record<EnvironmentId, string> = {
  dev: 'dev',
  stage: 'stg',
  prod: 'prd'
}

const DOPPLER_PROJECT = 'journeys-admin'
const FIREBASE_API_KEY_SECRET = 'NEXT_PUBLIC_FIREBASE_API_KEY'

const execFileAsync = promisify(execFile)
const firebaseApiKeyCache = new Map<EnvironmentId, string>()

/**
 * Resolve the Firebase web API key for an environment by shelling out to the
 * Doppler CLI. Reads `NEXT_PUBLIC_FIREBASE_API_KEY` from the `journeys-admin`
 * project, choosing the config matching the active environment. Requires the
 * developer to have run `doppler login`. Only invoked during `/impersonate`,
 * and the result is cached for the process lifetime.
 */
export async function resolveFirebaseApiKey(
  env: EnvironmentConfig
): Promise<string> {
  const cached = firebaseApiKeyCache.get(env.id)
  if (cached != null) return cached

  const config = DOPPLER_CONFIG_BY_ENV[env.id]
  try {
    const { stdout } = await execFileAsync('doppler', [
      'secrets',
      'get',
      FIREBASE_API_KEY_SECRET,
      '--project',
      DOPPLER_PROJECT,
      '--config',
      config,
      '--plain'
    ])
    const apiKey = stdout.trim()
    if (apiKey.length === 0) {
      throw new Error(
        `Doppler returned an empty ${FIREBASE_API_KEY_SECRET} for ${DOPPLER_PROJECT}/${config}.`
      )
    }
    firebaseApiKeyCache.set(env.id, apiKey)
    return apiKey
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new Error(
      `Failed to read ${FIREBASE_API_KEY_SECRET} from Doppler (project: ${DOPPLER_PROJECT}, config: ${config}). Make sure the Doppler CLI is installed and you have run \`doppler login\`. Underlying error: ${detail}`
    )
  }
}
