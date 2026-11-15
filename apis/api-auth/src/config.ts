import { createHash } from 'node:crypto'

import { z } from 'zod'

const endpoint = z
  .string()
  .url()
  .transform((value, ctx) => {
    const url = new URL(value)
    const local = ['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname)
    if (
      (url.protocol !== 'https:' && !(local && url.protocol === 'http:')) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash ||
      url.pathname !== '/'
    ) {
      ctx.addIssue({ code: 'custom', message: 'Expected an HTTPS origin' })
      return z.NEVER
    }
    return url.origin
  })

const configuration = z.object({
  AUTH_ENVIRONMENT: z.enum(['local', 'stage', 'production']),
  AUTH_ISSUER: endpoint,
  AUTH_ADMIN_ORIGIN: endpoint,
  AUTH_AUDIENCE: z.string().url(),
  AUTH_GATEWAY_URL: z.string().url(),
  AUTH_FIREBASE_PROJECT_ID: z.string().min(1),
  AUTH_COOKIE_KEYS: z
    .string()
    .transform((value) => value.split(','))
    .pipe(z.array(z.string().min(32)).min(1)),
  AUTH_JWKS: z
    .string()
    .transform(
      (value) => JSON.parse(value) as { keys: Array<Record<string, unknown>> }
    ),
  AUTH_INTROSPECTION_CLIENT_ID: z.string().min(1),
  AUTH_INTROSPECTION_CLIENT_SECRET: z.string().min(32),
  PG_DATABASE_URL_AUTH: z.string().url(),
  AUTH_HOST: z.string().default('127.0.0.1'),
  AUTH_PORT: z.coerce.number().int().min(1).max(65535).default(4011),
  AUTH_CLIENTS: z
    .string()
    .default('[]')
    .transform((value) => JSON.parse(value) as unknown)
    .pipe(
      z.array(
        z.object({
          client_id: z.string().min(1),
          client_name: z.string().min(1).max(120),
          redirect_uris: z.array(z.string().url()).min(1).max(5)
        })
      )
    ),
  AUTH_CIMD_ORIGINS: z
    .string()
    .default('')
    .transform((value) => value.split(',').filter(Boolean))
})

export type AuthConfig = z.infer<typeof configuration>

export function readConfig(env: NodeJS.ProcessEnv): AuthConfig {
  const config = configuration.parse(env)
  if (env.PG_DATABASE_URL_AUTH_MIGRATION)
    throw new Error('Migration authority in runtime')
  if (
    config.AUTH_JWKS.keys.length === 0 ||
    !config.AUTH_JWKS.keys.every((key) => key.d && key.kid && key.kty)
  ) {
    throw new Error('Private issuer keys required')
  }
  if (config.AUTH_ENVIRONMENT !== 'local') {
    for (const value of [
      config.AUTH_ISSUER,
      config.AUTH_ADMIN_ORIGIN,
      config.AUTH_AUDIENCE,
      config.AUTH_GATEWAY_URL
    ]) {
      if (new URL(value).protocol !== 'https:')
        throw new Error('HTTPS required')
    }
    if (
      new URL(config.PG_DATABASE_URL_AUTH).searchParams.get('sslmode') !==
      'verify-full'
    ) {
      throw new Error('Verified database TLS required')
    }
  }
  for (const value of [config.AUTH_AUDIENCE, config.AUTH_GATEWAY_URL]) {
    const url = new URL(value)
    if (
      !['http:', 'https:'].includes(url.protocol) ||
      url.username ||
      url.password ||
      url.search ||
      url.hash
    )
      throw new Error('Invalid service endpoint')
  }
  for (const origin of config.AUTH_CIMD_ORIGINS) {
    if (
      endpoint.parse(origin) !== origin ||
      origin === config.AUTH_ISSUER ||
      origin === new URL(config.AUTH_AUDIENCE).origin
    ) {
      throw new Error('Invalid metadata origin')
    }
  }
  return config
}

export function environmentBinding(config: AuthConfig): string {
  return createHash('sha256')
    .update(
      JSON.stringify([
        config.AUTH_ENVIRONMENT,
        config.AUTH_ISSUER,
        config.AUTH_ADMIN_ORIGIN,
        config.AUTH_AUDIENCE,
        config.AUTH_FIREBASE_PROJECT_ID
      ])
    )
    .digest('hex')
}
