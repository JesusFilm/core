import pino from 'pino'

import { createAuthDatabase } from '@core/prisma/auth/client'

import type { AuthConfig } from '../src/config'
import { createRuntime } from '../src/runtime'

// Controlled adapters are imported only by this test entrypoint.
const config = JSON.parse(
  process.env.AUTH_FIXTURE_CONFIG ?? 'null'
) as AuthConfig
const db = createAuthDatabase(config.PG_DATABASE_URL_AUTH)
try {
  const runtime = await createRuntime(config, {
    db,
    identity: {
      async authenticate(token) {
        if (!['alice', 'bob'].includes(token))
          throw new Error('Invalid identity')
        return {
          userId: token,
          authTime: 1794777000,
          createdAt: '2026-01-01T00:00:00.000Z'
        }
      },
      async check(evidence) {
        if (!['alice', 'bob'].includes(evidence.userId))
          throw new Error('Invalid identity')
      }
    },
    eligibility: async (_token, userId) =>
      userId === 'alice'
        ? [
            {
              id: 'draft-a',
              title: 'Synthetic draft',
              teamId: 'read-team',
              canEdit: true
            }
          ]
        : [
            {
              id: 'bob-draft',
              title: 'Bob draft',
              teamId: 'read-team',
              canEdit: true
            }
          ],
    logger: pino({ enabled: false })
  })
  runtime.server.listen(0, '127.0.0.1', () => {
    process.send?.({
      port: (runtime.server.address() as { port: number }).port
    })
  })
  process.once('SIGTERM', () => {
    void runtime
      .close()
      .then(() => db.$disconnect())
      .finally(() => process.exit())
  })
} catch {
  process.send?.({ error: 'fixture_startup_failed' })
  await db.$disconnect()
  process.exitCode = 1
}
