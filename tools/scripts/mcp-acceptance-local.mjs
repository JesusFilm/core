import { spawnSync } from 'node:child_process'
import { randomBytes } from 'node:crypto'
import { mkdir, readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import * as acceptanceModule from '../../apis/api-mcp/src/acceptance.ts'

const { executedCounts } = acceptanceModule.default ?? acceptanceModule

const require = createRequire(import.meta.url)
const { Client } = createRequire(require.resolve('@prisma/adapter-pg'))('pg')

function run(args, env = {}) {
  const result = spawnSync('pnpm', args, {
    stdio: 'inherit',
    env: { ...process.env, ...env }
  })
  if (result.error || result.status !== 0)
    throw new Error('Owning suite failed')
}

export function localDatabaseSource(value) {
  const source = new URL(value)
  if (
    !['localhost', '127.0.0.1', '[::1]'].includes(source.hostname) ||
    !['postgres:', 'postgresql:'].includes(source.protocol)
  )
    throw new Error('Use a local isolated PostgreSQL server')
  return source
}

/** Reuse the owning suites with fresh #10565 databases and real runtime grants.
 * Never point them at another implementation ticket's reusable databases.
 */
export async function executeLocalSuite(suite, directory) {
  const source = localDatabaseSource(
    process.env.MCP_ACCEPTANCE_POSTGRES_URL ??
      'postgresql://postgres:postgres@localhost:5432/postgres'
  )
  const suffix = randomBytes(8).toString('hex')
  const issue = `10565_${suffix}`
  const role = `mcp_acceptance_${suffix}`
  const password = randomBytes(24).toString('hex')
  const created = []
  const admin = new Client({ connectionString: source.href })
  let roleCreated = false
  const urls = {}
  const output = resolve(directory, suite.id)
  await mkdir(output, { recursive: true })
  await admin.connect()
  try {
    run(['exec', 'nx', 'run-many', '-t', 'prisma-generate', '--all'], {
      DISABLE_ERD: 'true'
    })
    await admin.query(
      `CREATE ROLE "${role}" LOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS PASSWORD '${password}'`
    )
    roleCreated = true
    for (const [key, domain] of [
      ['auth', 'auth'],
      ['issuer', 'auth'],
      ['reads', 'auth'],
      ['permissions', 'auth'],
      ['journeys', 'journeys'],
      ['media', 'media'],
      ['languages', 'languages'],
      ['users', 'users']
    ]) {
      const database = `${domain}_issue_${issue}_${key}`
      await admin.query(`CREATE DATABASE "${database}"`)
      created.push(database)
      const url = new URL(source)
      url.pathname = `/${database}`
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
            : `PG_DATABASE_URL_${domain.toUpperCase()}`]: url.href
        }
      )
      if (domain === 'auth') {
        const migration = new Client({ connectionString: url.href })
        await migration.connect()
        try {
          await migration.query('REVOKE ALL ON SCHEMA public FROM PUBLIC')
          await migration.query(
            `REVOKE ALL ON DATABASE "${database}" FROM PUBLIC`
          )
          await migration.query(
            `GRANT CONNECT ON DATABASE "${database}" TO "${role}"`
          )
          await migration.query(`GRANT USAGE ON SCHEMA public TO "${role}"`)
          await migration.query(
            (await readFile('libs/prisma/auth/grants.sql', 'utf8')).replaceAll(
              ':"runtime_role"',
              `"${role}"`
            )
          )
        } finally {
          await migration.end()
        }
        urls[`${key}Migration`] = url.href
        url.username = role
        url.password = password
      }
      urls[key] = url.href
    }
    const env = {
      AUTH_TEST_DATABASE_URL: urls.issuer,
      AUTH_TEST_MIGRATION_DATABASE_URL: urls.issuerMigration,
      READS_TEST_AUTH_DATABASE_URL: urls.reads,
      READS_TEST_JOURNEYS_DATABASE_URL: urls.journeys,
      READS_TEST_USERS_DATABASE_URL: urls.users,
      PERMISSIONS_TEST_DATABASE_URL: urls.permissions,
      STRUCTURE_TEST_ISSUE: issue,
      UPLOAD_TEST_ISSUE: issue,
      MEDIA_TEST_ISSUE: issue,
      MCP_STRUCTURE_TEST_ISSUE: issue,
      MCP_OPERATIONS_ONLY_CONTROLS: 'false'
    }
    for (const prefix of ['EDITS', 'STRUCTURE', 'UPLOAD', 'MEDIA'])
      for (const domain of ['auth', 'journeys', 'media', 'languages'])
        env[`${prefix}_TEST_${domain.toUpperCase()}_DATABASE_URL`] =
          urls[domain]
    const root =
      suite.id === 'reads'
        ? 'apis/api-auth'
        : suite.id === 'protocol'
          ? 'apis/api-mcp'
          : suite.id === 'admin-components'
            ? 'apps/journeys-admin'
            : '.'
    run(
      [
        'exec',
        'vitest',
        'run',
        '--root',
        resolve(root),
        '--config',
        resolve(suite.config),
        '--fileParallelism=false',
        '--maxWorkers=1',
        '--reporter=default',
        '--reporter=json',
        `--outputFile=${output}/tests.json`,
        `--coverage.reportsDirectory=${output}/coverage`,
        '--coverage.reporter=json',
        '--coverage.reporter=cobertura',
        ...(suite.filters ?? [])
      ],
      env
    )
    const tests = await readFile(`${output}/tests.json`)
    executedCounts(JSON.parse(tests))
    const coverage = JSON.parse(
      await readFile(`${output}/coverage/coverage-final.json`, 'utf8')
    )
    const xml = await readFile(
      `${output}/coverage/cobertura-coverage.xml`,
      'utf8'
    )
    for (const module of suite.modules) {
      const entry = Object.entries(coverage).find(([path]) =>
        path.endsWith('/' + module)
      )?.[1]
      if (
        !entry ||
        !Object.values(entry.s).some((hits) => hits > 0) ||
        !xml.includes(`filename="${module}"`)
      )
        throw new Error(
          `Missing executed repository-relative coverage: ${module}`
        )
    }
    return tests
  } finally {
    for (const database of created.reverse())
      await admin.query(`DROP DATABASE "${database}" WITH (FORCE)`)
    if (roleCreated) await admin.query(`DROP ROLE "${role}"`)
    await admin.end()
  }
}
