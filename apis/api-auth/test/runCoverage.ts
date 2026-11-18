import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { createAuthDatabase } from '@core/prisma/auth/client'

// This command owns only the fresh databases and role named by this invocation.
// It never resets a supplied database or uses live identity/provider credentials.
const adminUrl = process.env.MCP_READS_TEST_POSTGRES_URL
if (!adminUrl) throw new Error('MCP_READS_TEST_POSTGRES_URL is required')
const root = resolve(import.meta.dirname, '../../..')
const suffix = randomBytes(8).toString('hex')
const runtimeRole = `mcp_reads_${suffix}`
const password = randomBytes(24).toString('hex')
const databases = {
  auth: `auth_issue_10575_${suffix}`,
  reads: `auth_issue_10575_reads_${suffix}`,
  permissions: `auth_issue_10550_permissions_${suffix}`,
  journeys: `journeys_issue_10575_${suffix}`,
  users: `users_issue_10550_${suffix}`
}
const created: string[] = []
let roleCreated = false
const admin = createAuthDatabase(adminUrl)
function url(database: string, runtime = false): string {
  const value = new URL(adminUrl!)
  value.pathname = `/${database}`
  if (runtime) {
    value.username = runtimeRole
    value.password = password
  }
  return value.href
}
function run(args: string[], env: NodeJS.ProcessEnv = {}) {
  const result = spawnSync('pnpm', args, {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, ...env }
  })
  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(`${args[1]} failed: ${result.status}`)
}

try {
  await admin.$executeRawUnsafe(
    `CREATE ROLE "${runtimeRole}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD '${password}'`
  )
  roleCreated = true
  for (const [database, domain] of [
    [databases.auth, 'auth'],
    [databases.reads, 'auth'],
    [databases.permissions, 'auth'],
    [databases.journeys, 'journeys'],
    [databases.users, 'users']
  ] as const) {
    await admin.$executeRawUnsafe(`CREATE DATABASE "${database}"`)
    created.push(database)
    const auth = domain === 'auth'
    const migrationVariable = {
      auth: 'PG_DATABASE_URL_AUTH_MIGRATION',
      journeys: 'PG_DATABASE_URL_JOURNEYS',
      users: 'PG_DATABASE_URL_USERS'
    }[domain]
    run(
      [
        'exec',
        'prisma',
        'migrate',
        'deploy',
        '--config',
        `libs/prisma/${domain}/prisma.config.ts`
      ],
      { [migrationVariable]: url(database) }
    )
    if (!auth) continue
    const migration = createAuthDatabase(url(database))
    try {
      await migration.$executeRawUnsafe(
        'REVOKE ALL ON SCHEMA public FROM PUBLIC'
      )
      await migration.$executeRawUnsafe(
        `REVOKE ALL ON DATABASE "${database}" FROM PUBLIC`
      )
      await migration.$executeRawUnsafe(
        `GRANT CONNECT ON DATABASE "${database}" TO "${runtimeRole}"`
      )
      await migration.$executeRawUnsafe(
        `GRANT USAGE ON SCHEMA public TO "${runtimeRole}"`
      )
      await migration.$executeRawUnsafe(
        readFileSync(
          resolve(root, 'libs/prisma/auth/grants.sql'),
          'utf8'
        ).replaceAll(':"runtime_role"', `"${runtimeRole}"`)
      )
    } finally {
      await migration.$disconnect()
    }
  }
  run(
    [
      'exec',
      'vitest',
      'run',
      '--config',
      'apis/api-auth/vitest.config.mts',
      '--coverage',
      '--reporter=default',
      '--reporter=json',
      `--outputFile=${resolve(root, 'coverage/apis/api-auth/tests.json')}`
    ],
    {
      AUTH_TEST_DATABASE_URL: url(databases.auth, true),
      AUTH_TEST_MIGRATION_DATABASE_URL: url(databases.auth),
      PERMISSIONS_TEST_DATABASE_URL: url(databases.permissions, true),
      READS_TEST_AUTH_DATABASE_URL: url(databases.reads, true),
      READS_TEST_JOURNEYS_DATABASE_URL: url(databases.journeys),
      READS_TEST_USERS_DATABASE_URL: url(databases.users)
    }
  )
  run(['exec', 'tsx', 'apis/api-auth/test/verifyCoverage.ts'])
} finally {
  // Disconnect fixture pools before removing exactly the resources we created.
  for (const database of created.reverse())
    await admin.$executeRawUnsafe(`DROP DATABASE "${database}" WITH (FORCE)`)
  if (roleCreated) await admin.$executeRawUnsafe(`DROP ROLE "${runtimeRole}"`)
  await admin.$disconnect()
}
