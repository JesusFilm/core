import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { spawnSync } from 'node:child_process'

const require = createRequire(import.meta.url)
const { Client } = createRequire(require.resolve('@prisma/adapter-pg'))('pg')
const issue = '10560'
const source = new URL(
  process.env.MCP_UPLOAD_TEST_POSTGRES_URL ??
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
    `journeys_issue_${issue}`,
    `media_issue_${issue}`,
    `languages_issue_${issue}`
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
  ['journeys', `journeys_issue_${issue}`],
  ['media', `media_issue_${issue}`],
  ['languages', `languages_issue_${issue}`]
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
        : `PG_DATABASE_URL_${domain.toUpperCase()}`]: connection(database)
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
    'apis/api-auth/vitest.image-upload.config.mts'
  ],
  {
    UPLOAD_TEST_AUTH_DATABASE_URL: runtime.href,
    UPLOAD_TEST_JOURNEYS_DATABASE_URL: connection(`journeys_issue_${issue}`),
    UPLOAD_TEST_MEDIA_DATABASE_URL: connection(`media_issue_${issue}`),
    UPLOAD_TEST_LANGUAGES_DATABASE_URL: connection(`languages_issue_${issue}`),
    AUTH_TEST_DATABASE_URL: issuerRuntime.href,
    AUTH_TEST_MIGRATION_DATABASE_URL: connection(`auth_issue_${issue}_issuer`)
  }
)

const reportDirectory = 'coverage/integration/mcp-image-upload'
const tests = JSON.parse(
  readFileSync(`${reportDirectory}/test-results.json`, 'utf8')
)
if (!tests.numTotalTests || tests.numPassedTests !== tests.numTotalTests)
  throw new Error('Media coverage requires every test to pass with no skips')
const coverage = JSON.parse(
  readFileSync(`${reportDirectory}/coverage-final.json`, 'utf8')
)
const cobertura = readFileSync(
  `${reportDirectory}/cobertura-coverage.xml`,
  'utf8'
)
for (const module of [
  'apis/api-auth/src/mediaJobs.ts',
  'apis/api-media/src/lib/mcpMediaJobs.ts',
  'apis/api-media/src/lib/mcpMediaExecutor.ts',
  'apis/api-media/src/lib/mcpMediaJobHttp.ts',
  'apis/api-media/src/lib/mcpImageInput.ts',
  'apis/api-journeys/src/lib/mcpMediaClient.ts',
  'apis/api-journeys/src/lib/mcpEdits.ts',
  'apis/api-journeys/src/lib/mcpStructureHistory.ts',
  'apis/api-media/src/lib/mcpMediaSources.ts',
  'apis/api-media/src/lib/mcpMediaMutations.ts',
  'apis/api-media/src/lib/mcpMediaProviders.ts',
  'apis/api-media/src/lib/mcpMediaRuntime.ts',
  'libs/prisma/media/src/client.ts',
  'libs/yoga/src/mcp/mediaContract.ts'
]) {
  const entry = Object.entries(coverage).find(([path]) =>
    path.endsWith('/' + module)
  )?.[1]
  if (!entry || !Object.values(entry.s).some((hits) => hits > 0))
    throw new Error(`Missing executed owning/shared coverage for ${module}`)
  if (!cobertura.includes(`filename="${module}"`))
    throw new Error(`Missing repository-relative Codecov path: ${module}`)
}
