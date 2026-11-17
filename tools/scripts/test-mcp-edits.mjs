import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const { Client } = createRequire(require.resolve('@prisma/adapter-pg'))('pg')
const source = new URL(
  process.env.MCP_EDITS_TEST_POSTGRES_URL ??
    'postgresql://postgres:postgres@localhost:5432/postgres'
)
if (!['localhost', '127.0.0.1', '[::1]'].includes(source.hostname))
  throw new Error('Use an isolated local PostgreSQL test server')
const connection = (database) => {
  const url = new URL(source)
  url.pathname = `/${database}`
  url.search = '?schema=public'
  return url.href
}
function run(args, env = {}) {
  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}
const admin = new Client({ connectionString: source.href })
await admin.connect()
try {
  for (const database of ['auth_issue_10553', 'journeys_issue_10553']) {
    const exists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname=$1',
      [database]
    )
    if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database}"`)
  }
  if (
    !(
      await admin.query(
        "SELECT 1 FROM pg_roles WHERE rolname='mcp_issue_10553'"
      )
    ).rowCount
  )
    await admin.query(
      "CREATE ROLE mcp_issue_10553 LOGIN PASSWORD 'controlled-local-10553'"
    )
} finally {
  await admin.end()
}
run(['exec', 'nx', 'run-many', '-t', 'prisma-generate', '--all'])
for (const domain of ['auth', 'journeys'])
  run(
    [
      'exec',
      'prisma',
      'migrate',
      'deploy',
      '--config',
      `libs/prisma/${domain}/prisma.config.ts`
    ],
    {
      [domain === 'auth'
        ? 'PG_DATABASE_URL_AUTH_MIGRATION'
        : 'PG_DATABASE_URL_JOURNEYS']: connection(`${domain}_issue_10553`)
    }
  )
const auth = new Client({ connectionString: connection('auth_issue_10553') })
await auth.connect()
try {
  await auth.query(
    'GRANT CONNECT ON DATABASE auth_issue_10553 TO mcp_issue_10553'
  )
  await auth.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC')
  await auth.query('GRANT USAGE ON SCHEMA public TO mcp_issue_10553')
  await auth.query(
    'GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mcp_issue_10553'
  )
} finally {
  await auth.end()
}
const runtime = new URL(connection('auth_issue_10553'))
runtime.username = 'mcp_issue_10553'
runtime.password = 'controlled-local-10553'
run(
  [
    'exec',
    'vitest',
    'run',
    '--config',
    'apis/api-auth/vitest.config.mts',
    'apis/api-auth/test/grantedEdits.spec.ts',
    '--coverage=false'
  ],
  {
    EDITS_TEST_AUTH_DATABASE_URL: runtime.href,
    EDITS_TEST_JOURNEYS_DATABASE_URL: connection('journeys_issue_10553')
  }
)
