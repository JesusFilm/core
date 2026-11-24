import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const { Client } = createRequire(require.resolve('@prisma/adapter-pg'))('pg')
const suite = process.env.MCP_STRUCTURE_TEST_SUITE ?? 'structure'
if (!['structure', 'appearance'].includes(suite))
  throw new Error('Unknown MCP integration suite')
const issue =
  process.env.MCP_STRUCTURE_TEST_ISSUE ??
  (suite === 'appearance' ? '10561' : '10557')
if (!/^[0-9]+(?:_[a-z0-9]+)?$/.test(issue))
  throw new Error('Use an issue-specific isolated database name')
const source = new URL(
  process.env.MCP_STRUCTURE_TEST_POSTGRES_URL ??
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
  for (const database of [
    `auth_issue_${issue}`,
    `auth_issue_${issue}_issuer`,
    `journeys_issue_${issue}`
  ]) {
    const exists = await admin.query(
      'SELECT 1 FROM pg_database WHERE datname=$1',
      [database]
    )
    if (!exists.rowCount) await admin.query(`CREATE DATABASE "${database}"`)
  }
  if (
    !(
      await admin.query('SELECT 1 FROM pg_roles WHERE rolname=$1', [
        `mcp_issue_${issue}`
      ])
    ).rowCount
  )
    await admin.query(
      `CREATE ROLE mcp_issue_${issue} LOGIN PASSWORD 'controlled-local-${issue}'`
    )
} finally {
  await admin.end()
}
run(['exec', 'nx', 'run-many', '-t', 'prisma-generate', '--all'])
for (const [domain, database] of [
  ['auth', `auth_issue_${issue}`],
  ['auth', `auth_issue_${issue}_issuer`],
  ['journeys', `journeys_issue_${issue}`]
])
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
        : 'PG_DATABASE_URL_JOURNEYS']: connection(database)
    }
  )
for (const database of [`auth_issue_${issue}`, `auth_issue_${issue}_issuer`]) {
  const auth = new Client({ connectionString: connection(database) })
  await auth.connect()
  try {
    await auth.query(
      `GRANT CONNECT ON DATABASE "${database}" TO mcp_issue_${issue}`
    )
    await auth.query('REVOKE CREATE ON SCHEMA public FROM PUBLIC')
    await auth.query(`GRANT USAGE ON SCHEMA public TO mcp_issue_${issue}`)
    await auth.query(
      `GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO mcp_issue_${issue}`
    )
  } finally {
    await auth.end()
  }
}
const runtime = new URL(connection(`auth_issue_${issue}`))
runtime.username = `mcp_issue_${issue}`
runtime.password = `controlled-local-${issue}`
const issuerRuntime = new URL(runtime)
issuerRuntime.pathname = `/auth_issue_${issue}_issuer`
run(
  [
    'exec',
    'vitest',
    'run',
    '--config',
    `apis/api-auth/vitest.${suite}.config.mts`
  ],
  {
    STRUCTURE_TEST_ISSUE: issue,
    STRUCTURE_TEST_AUTH_DATABASE_URL: runtime.href,
    STRUCTURE_TEST_JOURNEYS_DATABASE_URL: connection(`journeys_issue_${issue}`),
    AUTH_TEST_DATABASE_URL: issuerRuntime.href,
    AUTH_TEST_MIGRATION_DATABASE_URL: connection(`auth_issue_${issue}_issuer`)
  }
)

const reportDirectory = `coverage/integration/mcp-${suite}`
const tests = JSON.parse(
  readFileSync(`${reportDirectory}/test-results.json`, 'utf8')
)
if (!tests.numTotalTests || tests.numPassedTests !== tests.numTotalTests)
  throw new Error(
    'Structural coverage requires every test to pass with no skips'
  )
const coverage = JSON.parse(
  readFileSync(`${reportDirectory}/coverage-final.json`, 'utf8')
)
for (const module of suite === 'appearance'
  ? [
      'apis/api-journeys/src/lib/mcpAppearance.ts',
      'apis/api-journeys/src/lib/mcpAppearanceEntities.ts',
      'apis/api-journeys/src/schema/campaign/gatewayClient.ts',
      'apis/api-journeys/src/lib/gateway/graphqlRequest.ts',
      'libs/yoga/src/mcp/appearanceContract.ts',
      'libs/shared/ui/src/libs/fontFamilies/fontFamilies.ts'
    ]
  : [
      'apis/api-journeys/src/lib/mcpStructure.ts',
      'apis/api-journeys/src/lib/mcpStructureState.ts',
      'apis/api-journeys/src/lib/mcpStructureHistory.ts',
      'apis/api-journeys/src/schema/block/service.ts',
      'apis/api-journeys/src/schema/block/blockDelete.mutation.ts',
      'apis/api-journeys/src/schema/block/blockRestore.mutation.ts',
      'libs/yoga/src/mcp/structureContract.ts'
    ]) {
  const entry = Object.entries(coverage).find(([path]) =>
    path.endsWith('/' + module)
  )?.[1]
  if (!entry || !Object.values(entry.s).some((hits) => hits > 0))
    throw new Error(`Missing executed owning/shared coverage for ${module}`)
}

// Static barrel exports have no V8 statement counters. Keep their report while
// requiring execution hits in the catalog consumed through that barrel above.
if (
  suite === 'appearance' &&
  !Object.keys(coverage).some((path) =>
    path.endsWith('/libs/shared/ui/src/libs/fontFamilies/index.ts')
  )
)
  throw new Error('Missing shared font barrel coverage report')
