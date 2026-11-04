import { randomUUID } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { PrismaClient } from '@core/prisma/journeys/client'
import { PrismaPg } from '@prisma/adapter-pg'

/**
 * Runs `20261027000000_campaign_domain/migration.sql` against a real
 * Postgres: the data fix, de-duplication, unique index, cascade and CHECK
 * are database behaviour a Prisma mock cannot show. Opt-in, since unit runs
 * have no database: set MIGRATION_TEST_DATABASE_URL to a scratch database.
 * Each run works in a throwaway schema that it drops afterwards.
 */
const DATABASE_URL = process.env.MIGRATION_TEST_DATABASE_URL

const MIGRATION_SQL = readFileSync(
  resolve(
    __dirname,
    '../../../../../libs/prisma/journeys/db/migrations/20261027000000_campaign_domain/migration.sql'
  ),
  'utf-8'
)

/** The tables as `add_campaign_builder` left them, cut to what the migration touches. */
const PRE_MIGRATION_SQL = [
  'CREATE TABLE "Campaign" ("id" TEXT PRIMARY KEY)',
  `CREATE TABLE "CustomDomain" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL UNIQUE,
    "journeyCollectionId" TEXT,
    "campaignId" TEXT,
    "routeAllTeamJourneys" BOOLEAN NOT NULL DEFAULT true
  )`,
  'CREATE INDEX "CustomDomain_campaignId_idx" ON "CustomDomain"("campaignId")',
  'ALTER TABLE "CustomDomain" ADD CONSTRAINT "CustomDomain_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE'
]

/** The migration's statements, comments dropped, one per call. */
function statements(sql: string): string[] {
  return sql
    .split('\n')
    .filter((line) => !line.trimStart().startsWith('--'))
    .join('\n')
    .split(/;\s*(?:\n|$)/)
    .map((statement) => statement.trim())
    .filter((statement) => statement !== '')
}

interface DomainRow {
  id: string
  name: string
  campaignId: string | null
}

describe('migration 20261027000000_campaign_domain', () => {
  describe.skipIf(DATABASE_URL == null)(
    'against MIGRATION_TEST_DATABASE_URL',
    () => {
      const schema = `campaign_domain_${randomUUID().replace(/-/g, '')}`
      let admin: PrismaClient
      let db: PrismaClient

      async function domains(): Promise<DomainRow[]> {
        return await db.$queryRawUnsafe<DomainRow[]>(
          'SELECT "id", "name", "campaignId" FROM "CustomDomain" ORDER BY "id"'
        )
      }

      beforeAll(async () => {
        admin = new PrismaClient({
          adapter: new PrismaPg({ connectionString: DATABASE_URL })
        })
        await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`)
        db = new PrismaClient({
          adapter: new PrismaPg({
            connectionString: DATABASE_URL,
            options: `-c search_path="${schema}"`
          })
        })
        for (const statement of PRE_MIGRATION_SQL)
          await db.$executeRawUnsafe(statement)
        await db.$executeRawUnsafe(
          `INSERT INTO "Campaign" VALUES ('c1'), ('c2'), ('c3'), ('c4')`
        )
        await db.$executeRawUnsafe(`INSERT INTO "CustomDomain" VALUES
        ('routeAll', 'routeall.example', NULL, 'c1', true),
        ('collection', 'collection.example', 'collectionId', 'c1', false),
        ('dupB', 'b.example', NULL, 'c2', false),
        ('dupA', 'a.example', NULL, 'c2', false),
        ('solo', 'solo.example', NULL, 'c3', false),
        ('team', 'team.example', NULL, NULL, true)`)
        for (const statement of statements(MIGRATION_SQL))
          await db.$executeRawUnsafe(statement)
      })

      afterAll(async () => {
        await db?.$disconnect()
        await admin?.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`)
        await admin?.$disconnect()
      })

      it('takes the campaign off route-all and collection domains', async () => {
        const rows = await domains()
        expect(rows.find(({ id }) => id === 'routeAll')?.campaignId).toBeNull()
        expect(
          rows.find(({ id }) => id === 'collection')?.campaignId
        ).toBeNull()
      })

      it('keeps the first domain by name when two share a campaign', async () => {
        const rows = await domains()
        expect(rows.find(({ id }) => id === 'dupA')?.campaignId).toBe('c2')
        expect(rows.find(({ id }) => id === 'dupB')?.campaignId).toBeNull()
      })

      it('leaves a lone campaign domain and a team domain as they were', async () => {
        const rows = await domains()
        expect(rows.find(({ id }) => id === 'solo')?.campaignId).toBe('c3')
        expect(rows.find(({ id }) => id === 'team')?.campaignId).toBeNull()
      })

      it('rejects a second domain for a campaign', async () => {
        await expect(
          db.$executeRawUnsafe(
            `INSERT INTO "CustomDomain" VALUES ('second', 'second.example', NULL, 'c3', false)`
          )
        ).rejects.toThrow(/CustomDomain_campaignId_key|campaignId/)
      })

      it('rejects a campaign domain that routes team journeys', async () => {
        await expect(
          db.$executeRawUnsafe(
            `UPDATE "CustomDomain" SET "campaignId" = 'c4' WHERE "id" = 'team'`
          )
        ).rejects.toThrow(/CustomDomain_campaignDomain_check/)
      })

      it('rejects a campaign domain with a journey collection', async () => {
        await expect(
          db.$executeRawUnsafe(
            `INSERT INTO "CustomDomain" VALUES ('withCollection', 'with-collection.example', 'collectionId', 'c4', false)`
          )
        ).rejects.toThrow(/CustomDomain_campaignDomain_check/)
      })

      it('deletes a campaign’s domain with the campaign', async () => {
        await db.$executeRawUnsafe(
          `INSERT INTO "CustomDomain" VALUES ('c4Domain', 'c4.example', NULL, 'c4', false)`
        )
        await db.$executeRawUnsafe(`DELETE FROM "Campaign" WHERE "id" = 'c4'`)

        const rows = await domains()
        expect(rows.some(({ id }) => id === 'c4Domain')).toBe(false)
      })
    }
  )
})
