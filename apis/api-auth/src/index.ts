import pino from 'pino'

import { createAuthDatabase } from '@core/prisma/auth/client'

import { readConfig } from './config'
import { firebaseIdentity, gatewayEligibility } from './identity'
import { createRuntime } from './runtime'

const logger = pino({ name: 'api-auth', base: undefined })
let database: ReturnType<typeof createAuthDatabase> | undefined
let startedRuntime: Awaited<ReturnType<typeof createRuntime>> | undefined
try {
  const config = readConfig(process.env)
  const db = createAuthDatabase(config.PG_DATABASE_URL_AUTH)
  database = db
  const runtime = await createRuntime(config, {
    db,
    identity: firebaseIdentity(config),
    eligibility: gatewayEligibility(config),
    logger
  })
  startedRuntime = runtime
  await new Promise<void>((resolve, reject) => {
    runtime.server.once('error', reject)
    runtime.server.listen(config.AUTH_PORT, config.AUTH_HOST, () => {
      runtime.server.off('error', reject)
      resolve()
    })
  })
  for (const signal of ['SIGTERM', 'SIGINT'])
    process.once(signal, () => {
      void runtime
        .close()
        .then(() => db.$disconnect())
        .catch(() => {
          process.exitCode = 1
        })
    })
} catch {
  await startedRuntime?.close().catch(() => undefined)
  await database?.$disconnect().catch(() => undefined)
  logger.error({ event: 'startup_failed' })
  process.exitCode = 1
}
