import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
const controlsOnly = process.argv.includes('--controls-only')
const { Client } = createRequire(require.resolve('@prisma/adapter-pg'))('pg')
const source = new URL(
  process.env.MCP_OPERATIONS_TEST_POSTGRES_URL ??
    'postgresql://postgres:postgres@localhost:5432/postgres'
)
if (!['localhost', '127.0.0.1', '[::1]'].includes(source.hostname))
  throw new Error('Use an isolated local PostgreSQL test server')
const suffix = randomBytes(8).toString('hex')
const issue = `10564_${suffix}`
const role = `mcp_ops_${suffix}`
const password = randomBytes(24).toString('hex')
const created = []
let roleCreated = false
const admin = new Client({ connectionString: source.href })
const url = (domain, runtime = false) => {
  const result = new URL(source)
  result.pathname = `/${domain}_issue_${issue}`
  if (runtime) {
    result.username = role
    result.password = password
  }
  return result.href
}
function run(args, env = {}) {
  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  })
  if (result.error) throw result.error
  if (result.status !== 0)
    throw new Error(`Operations test command failed: ${result.status}`)
}
await admin.connect()
try {
  run(['exec', 'nx', 'run-many', '-t', 'prisma-generate', '--all'], {
    DISABLE_ERD: 'true'
  })
  await admin.query(
    `CREATE ROLE "${role}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD '${password}'`
  )
  roleCreated = true
  for (const domain of ['auth', 'journeys', 'media', 'languages']) {
    const database = `${domain}_issue_${issue}`
    await admin.query(`CREATE DATABASE "${database}"`)
    created.push(database)
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
          : `PG_DATABASE_URL_${domain.toUpperCase()}`]: url(domain)
      }
    )
    if (domain !== 'auth') continue
    const migration = new Client({ connectionString: url(domain) })
    await migration.connect()
    try {
      await migration.query('REVOKE ALL ON SCHEMA public FROM PUBLIC')
      await migration.query(`REVOKE ALL ON DATABASE "${database}" FROM PUBLIC`)
      await migration.query(
        `GRANT CONNECT ON DATABASE "${database}" TO "${role}"`
      )
      await migration.query(`GRANT USAGE ON SCHEMA public TO "${role}"`)
      await migration.query(
        readFileSync('libs/prisma/auth/grants.sql', 'utf8').replaceAll(
          ':"runtime_role"',
          `"${role}"`
        )
      )
    } finally {
      await migration.end()
    }
  }
  run(
    [
      'exec',
      'vitest',
      'run',
      '--config',
      'apis/api-auth/vitest.operations.config.mts'
    ],
    {
      MCP_OPERATIONS_ONLY_CONTROLS: String(controlsOnly),
      UPLOAD_TEST_ISSUE: issue,
      UPLOAD_TEST_AUTH_DATABASE_URL: url('auth', true),
      UPLOAD_TEST_JOURNEYS_DATABASE_URL: url('journeys'),
      UPLOAD_TEST_MEDIA_DATABASE_URL: url('media'),
      UPLOAD_TEST_LANGUAGES_DATABASE_URL: url('languages')
    }
  )
  const directory = `coverage/integration/mcp-operations${controlsOnly ? '-controls' : ''}`
  const tests = JSON.parse(
    readFileSync(`${directory}/test-results.json`, 'utf8')
  )
  if (!tests.numTotalTests || tests.numPassedTests !== tests.numTotalTests)
    throw new Error(
      'Operations coverage requires every test to pass without skips'
    )
  const coverage = JSON.parse(
    readFileSync(`${directory}/coverage-final.json`, 'utf8')
  )
  const cobertura = readFileSync(`${directory}/cobertura-coverage.xml`, 'utf8')
  for (const module of [
    'apis/api-auth/src/operations.ts',
    'apis/api-auth/src/reads.ts',
    'apis/api-auth/src/store.ts',
    'apis/api-journeys/src/lib/mcpEdits.ts',
    'apis/api-journeys/src/lib/mcpEditsStore.ts',
    'apis/api-mcp/src/release.ts',
    'tools/scripts/mcp-release.mjs',
    'tools/scripts/mcp-operations.mjs',
    ...(controlsOnly
      ? []
      : [
          'apis/api-auth/src/mediaJobs.ts',
          'apis/api-media/src/lib/mcpMediaJobs.ts',
          'apis/api-media/src/lib/mcpMediaRuntime.ts'
        ])
  ]) {
    const entry = Object.entries(coverage).find(([path]) =>
      path.endsWith('/' + module)
    )?.[1]
    if (!entry || !Object.values(entry.s).some((hits) => hits > 0))
      throw new Error(`Missing executed owning coverage: ${module}`)
    if (!cobertura.includes(`filename="${module}"`))
      throw new Error(`Missing repository-relative coverage: ${module}`)
  }
} finally {
  for (const database of created.reverse())
    await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`)
  if (roleCreated) await admin.query(`DROP ROLE "${role}"`)
  await admin.end()
}
