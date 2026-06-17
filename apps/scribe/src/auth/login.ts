import { loadCredential, saveCredential } from '../config/credentials'
import type { EnvironmentConfig } from '../config/environments'

import { browserLogin } from './browserLogin'

export interface ActiveSession {
  environment: EnvironmentConfig
  token: string
  email?: string
  userId?: string
}

export async function ensureSession(
  env: EnvironmentConfig,
  options: { forceLogin?: boolean } = {}
): Promise<ActiveSession> {
  if (!options.forceLogin) {
    const stored = loadCredential(env.id)
    if (stored != null) {
      return {
        environment: env,
        token: stored.token,
        email: stored.email,
        userId: stored.userId
      }
    }
  }

  const result = await browserLogin(env)
  saveCredential(env.id, {
    token: result.token,
    email: result.email,
    userId: result.userId
  })
  return {
    environment: env,
    token: result.token,
    email: result.email,
    userId: result.userId
  }
}
