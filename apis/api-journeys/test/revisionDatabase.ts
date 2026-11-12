import { execFileSync } from 'node:child_process'
import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { PrismaClient } from '@core/prisma/journeys/__generated__/client/client'
import { PrismaPg } from '@prisma/adapter-pg'

const root = resolve(import.meta.dirname, '../../..')
const baseUrl = process.env.JOURNEY_REVISION_TEST_DATABASE_URL
if (baseUrl == null) {
  throw new Error(
    'JOURNEY_REVISION_TEST_DATABASE_URL must name a local test PostgreSQL server with CREATEDB rights'
  )
}
const databaseName = `journey_revision_${randomUUID().replaceAll('-', '')}`
const databaseUrl = new URL(baseUrl)
databaseUrl.pathname = `/${databaseName}`

export const revisionDatabase = {
  oldWriterBlockedDuringMigration: false,
  admin: new PrismaClient({
    adapter: new PrismaPg({ connectionString: baseUrl })
  }),
  client: new PrismaClient({
    adapter: new PrismaPg({ connectionString: databaseUrl.toString() })
  }),
  async create() {
    await this.admin.$executeRawUnsafe(`CREATE DATABASE "${databaseName}"`)
    const sql = execFileSync(
      'pnpm',
      [
        'exec',
        'prisma',
        'migrate',
        'diff',
        '--from-empty',
        '--to-schema',
        'libs/prisma/journeys/db/schema.prisma',
        '--config',
        'libs/prisma/journeys/prisma.config.ts',
        '--script'
      ],
      {
        cwd: root,
        encoding: 'utf8',
        env: {
          ...process.env,
          PG_DATABASE_URL_JOURNEYS: databaseUrl.toString()
        }
      }
    )
    if (!sql.includes('CREATE TABLE "JourneyRevision"')) {
      throw new Error('Prisma did not generate the revision test schema')
    }
    await this.client.$executeRawUnsafe(sql)
    // Reproduce an old deployment before the additive migration/backfill.
    await this.client.$executeRawUnsafe('DROP TABLE "JourneyRevision"')
    await this.client.team.create({
      data: { id: 'legacy-team', title: 'Legacy' }
    })
    await this.client.journey.create({
      data: {
        id: 'legacy',
        title: 'Legacy',
        slug: 'legacy',
        teamId: 'legacy-team',
        languageId: '529',
        status: 'draft'
      }
    })
    const migration = readFileSync(
      resolve(
        root,
        'libs/prisma/journeys/db/migrations/20261112000000_shared_journey_revision/migration.sql'
      ),
      'utf8'
    )
    for (const match of migration.matchAll(/CREATE INDEX "([A-Za-z_]+)"/g)) {
      await this.client.$executeRawUnsafe(`DROP INDEX "${match[1]}"`)
    }
    await this.client.$transaction(async (tx) => {
      await tx.$executeRawUnsafe(
        migration.replace(/^BEGIN;\s*/, '').replace(/COMMIT;\s*$/, '')
      )
      // The migration has installed the triggers but has not committed yet.
      // An old binary cannot slip a write between backfill and activation.
      try {
        await this.client.$transaction(async (oldWriter) => {
          await oldWriter.$executeRawUnsafe("SET LOCAL lock_timeout = '100ms'")
          await oldWriter.$executeRawUnsafe(
            'UPDATE "Journey" SET "title" = \'Bypassed\' WHERE "id" = \'legacy\''
          )
        })
        throw new Error('old writer bypassed the uncommitted migration')
      } catch (error) {
        if (
          !(error instanceof Error) ||
          !error.message.includes('lock timeout')
        )
          throw error
        this.oldWriterBlockedDuringMigration = true
      }
    })
  },
  async destroy() {
    await this.client.$disconnect()
    await this.admin.$executeRawUnsafe(
      `DROP DATABASE IF EXISTS "${databaseName}" WITH (FORCE)`
    )
    await this.admin.$disconnect()
  }
}
