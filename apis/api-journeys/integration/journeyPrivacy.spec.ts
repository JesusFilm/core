import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { resolve } from 'node:path'

import { parse } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'
import { getUserFromPayload } from '@core/yoga/firebaseClient'

import { yoga } from '../src/yoga'
import { getClient } from '../test/client'

vi.hoisted(() => vi.stubEnv('NODE_ENV', 'production'))
vi.mock('@core/yoga/firebaseClient', () => ({ getUserFromPayload: vi.fn() }))
vi.mock('@graphql-hive/gateway', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@graphql-hive/gateway')>()),
  useHmacSignatureValidation: () => ({})
}))

// pg is the Prisma adapter's dependency. Keep this test transport at the
// database boundary without adding another production dependency.
interface SqlClient {
  connect(): Promise<void>
  end(): Promise<void>
  query(
    sql: string,
    values?: unknown[]
  ): Promise<{ rows: Record<string, unknown>[] }>
}
const require = createRequire(import.meta.url)
const adapterRequire = createRequire(require.resolve('@prisma/adapter-pg'))
const { Client } = adapterRequire('pg') as {
  Client: new (options: { connectionString: string }) => SqlClient
}
const databaseUrl = process.env.JOURNEY_PRIVACY_TEST_DATABASE_URL ?? ''
const sql = new Client({ connectionString: databaseUrl })
const root = resolve(__dirname, '../../..')
const migration = readFileSync(
  resolve(
    root,
    'libs/prisma/journeys/db/migrations/20261112040000_journey_publication_provenance/migration.sql'
  ),
  'utf8'
)
const owner = {
  id: 'owner',
  email: 'owner@example.com',
  firstName: 'Owner',
  emailVerified: true
}
const stranger = { ...owner, id: 'stranger' }
const client = getClient()

async function request(source: string) {
  return client({ document: parse(source) })
}

async function publicRead(id = 'private') {
  return request(
    `query { journey(id: "${id}", idType: databaseId, options: {skipRoutingFilter: true}) { id title blocks { id } } }`
  )
}

describe('journey privacy with PostgreSQL', () => {
  beforeAll(async () => {
    const url = new URL(databaseUrl)
    if (
      !['localhost', '127.0.0.1'].includes(url.hostname) ||
      url.pathname !== '/privacy_test'
    ) {
      throw new Error('Use an isolated localhost database named privacy_test')
    }
    await sql.connect()
    const ddl = execFileSync(
      'pnpm',
      [
        'exec',
        'prisma',
        'migrate',
        'diff',
        '--from-config-datasource',
        '--to-schema',
        'db/schema.prisma',
        '--script'
      ],
      {
        cwd: resolve(root, 'libs/prisma/journeys'),
        env: { ...process.env, PG_DATABASE_URL_JOURNEYS: databaseUrl },
        encoding: 'utf8',
        maxBuffer: 10_000_000
      }
    )
    if (!ddl.includes('CREATE TABLE'))
      throw new Error('Prisma produced no test schema')
    await sql.query(
      ddl.replace(/^\s*"firstPublishedAt" TIMESTAMP\(3\),\n/m, '')
    )
    await sql.query(`
    INSERT INTO "Team" (id, title, "updatedAt") VALUES ('team', 'Synthetic Team', now());
    INSERT INTO "Journey" (id, slug, title, "languageId", status, "teamId", "publishedAt") VALUES
      ('legacy-public', 'legacy-public', 'PUBLIC CONTENT', '529', 'published', 'team', '2026-01-01'),
      ('legacy-draft', 'legacy-draft', 'PRIVATE LEGACY DRAFT', '529', 'draft', 'team', NULL),
      ('legacy-ambiguous', 'legacy-ambiguous', 'PRIVATE AMBIGUOUS', '529', 'archived', 'team', '2026-01-01'),
      ('legacy-inactive', 'legacy-inactive', 'PRIVATE INACTIVE', '529', 'trashed', 'team', NULL);
  `)
    await sql.query(migration)
    await prisma.journey.create({
      data: {
        id: 'private',
        slug: 'private',
        title: 'PRIVATE HTTP SENTINEL',
        languageId: '529',
        status: 'draft',
        teamId: 'team',
        userJourneys: { create: { userId: owner.id, role: 'owner' } },
        journeyTheme: {
          create: { userId: owner.id, headerFont: 'PRIVATE FONT SENTINEL' }
        },
        blocks: {
          create: {
            id: 'private-video',
            typename: 'VideoBlock',
            title: 'PRIVATE VIDEO SENTINEL',
            source: 'youTube',
            videoId: 'private-source'
          }
        }
      }
    })
  })

  afterAll(async () => {
    await prisma.$disconnect()
    await sql.end()
    vi.unstubAllEnvs()
  })

  beforeEach(() => vi.mocked(getUserFromPayload).mockReturnValue(null))

  it('backfills only current publications and keeps ambiguous legacy records private', async () => {
    expect(await publicRead('legacy-public')).toMatchObject({
      data: { journey: { title: 'PUBLIC CONTENT' } }
    })
    for (const id of ['legacy-draft', 'legacy-ambiguous', 'legacy-inactive']) {
      const result = await publicRead(id)
      expect(result).toHaveProperty('errors')
      expect(JSON.stringify(result)).not.toContain('PRIVATE')
      expect(
        (await prisma.journey.findUniqueOrThrow({ where: { id } }))
          .firstPublishedAt
      ).toBeNull()
    }
  })

  it('preserves legitimate published delivery through archive, trash and delete', async () => {
    await prisma.userJourney.create({
      data: { journeyId: 'legacy-public', userId: owner.id, role: 'owner' }
    })
    for (const operation of [
      'journeysArchive',
      'journeysTrash',
      'journeysDelete'
    ]) {
      vi.mocked(getUserFromPayload).mockReturnValue(owner)
      expect(
        await request(
          `mutation { ${operation}(ids: ["legacy-public"]) { id status } }`
        )
      ).not.toHaveProperty('errors')
      vi.mocked(getUserFromPayload).mockReturnValue(null)
      expect(await publicRead('legacy-public')).toMatchObject({
        data: { journey: { title: 'PUBLIC CONTENT' } }
      })
    }
  })

  it('denies alternate public reads after warming private reads as an Admin', async () => {
    const privateQueries = [
      'query { adminJourney(id: "private", idType: databaseId) { title blocks { id ... on VideoBlock { title } } } }',
      'query { journeySimpleGet(id: "private") }',
      'query { journeyTheme(journeyId: "private") { headerFont userId } }',
      'query { _entities(representations: [{__typename: "Journey", id: "private"}]) { ... on Journey { title blocks { id } } } }',
      'query { _entities(representations: [{__typename: "VideoBlock", id: "private-video"}]) { ... on VideoBlock { title videoId } } }'
    ]
    for (const query of privateQueries) {
      vi.mocked(getUserFromPayload).mockReturnValue(owner)
      expect(JSON.stringify(await request(query))).toContain('PRIVATE')
      for (const user of [
        stranger,
        null,
        { ...stranger, id: 'second-stranger' }
      ]) {
        vi.mocked(getUserFromPayload).mockReturnValue(user)
        const result = await request(query)
        expect(JSON.stringify(result)).not.toContain('PRIVATE')
        expect(result).toHaveProperty('errors')
      }
    }
    vi.mocked(getUserFromPayload).mockReturnValue(owner)
    const response = await yoga.fetch('http://yoga/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: privateQueries[0] })
    })
    expect(response.headers.get('cache-control')).toBe('private, no-store')
    expect(await response.text()).toContain('PRIVATE')
    await prisma.userJourney.deleteMany({
      where: { journeyId: 'private', userId: owner.id }
    })
    for (const query of privateQueries) {
      const denied = await request(query)
      expect(denied).toHaveProperty('errors')
      expect(JSON.stringify(denied)).not.toContain('PRIVATE')
    }
    await prisma.userJourney.create({
      data: { journeyId: 'private', userId: owner.id, role: 'owner' }
    })
    for (const user of [null, stranger, owner]) {
      vi.mocked(getUserFromPayload).mockReturnValue(user)
      for (const idType of ['databaseId', 'slug']) {
        for (const filter of [
          '',
          ', options: {status: []}',
          ', options: {status: [draft, published, archived, trashed, deleted]}'
        ]) {
          expect(
            JSON.stringify(
              await request(
                `query { journey(id: "private", idType: ${idType}${filter}) { title blocks { id } } }`
              )
            )
          ).not.toContain('PRIVATE')
        }
      }
    }
  })

  it('does not expose foreign private image metadata through a public campaign', async () => {
    await prisma.block.create({
      data: {
        id: 'private-image',
        typename: 'ImageBlock',
        journeyId: 'private',
        src: 'https://example.com/PRIVATE-IMAGE-SOURCE.jpg',
        alt: 'PRIVATE-IMAGE-ALT'
      }
    })
    await prisma.journey.create({
      data: {
        id: 'public-carrier',
        slug: 'public-carrier',
        title: 'Public carrier',
        languageId: '529',
        status: 'published',
        teamId: 'team',
        primaryImageBlockId: 'private-image'
      }
    })
    await prisma.campaign.create({
      data: {
        id: 'public-campaign',
        slug: 'public-campaign',
        title: 'Public campaign',
        teamId: 'team',
        defaultLanguageId: '529',
        palette: [],
        status: 'published',
        publishedAt: new Date(),
        languages: { create: { languageId: '529', order: 0 } },
        pages: { create: { id: 'landing-page', kind: 'landing' } },
        blocks: {
          create: [
            { typename: 'CampaignHeaderBlock' },
            { typename: 'CampaignFooterBlock' }
          ]
        },
        theme: {
          create: {
            themeMode: 'light',
            primaryColor: '#000000',
            accentColor: '#000000',
            backgroundColor: '#FFFFFF',
            surfaceColor: '#FFFFFF',
            textColor: '#000000',
            mutedColor: '#000000',
            contrastBackgroundColor: '#000000',
            contrastTextColor: '#FFFFFF'
          }
        }
      }
    })
    await prisma.campaignBlock.create({
      data: {
        id: 'public-card',
        campaignId: 'public-campaign',
        pageId: 'landing-page',
        typename: 'CampaignJourneyBlock',
        journeyId: 'public-carrier'
      }
    })
    const result = await request(
      'query { campaignPublic(slug: "public-campaign") { pages { blocks { ... on CampaignJourneyBlock { journeyImage { src alt } } } } } }'
    )
    expect(result).not.toHaveProperty('errors')
    expect(result).toMatchObject({
      data: {
        campaignPublic: { pages: [{ blocks: [{ journeyImage: null }] }] }
      }
    })
    expect(JSON.stringify(result)).not.toContain('PRIVATE-IMAGE')
  })

  it('never publishes a private draft through Admin lifecycle transitions, then permits explicit publication', async () => {
    vi.mocked(getUserFromPayload).mockReturnValue(owner)
    for (const operation of [
      'journeysArchive',
      'journeysTrash',
      'journeysDelete'
    ]) {
      const changed = await request(
        `mutation { ${operation}(ids: ["private"]) { id status } }`
      )
      expect(changed).not.toHaveProperty('errors')
      const restored = await request(
        'mutation { journeysRestore(ids: ["private"]) { status publishedAt } }'
      )
      expect(restored).toMatchObject({
        data: { journeysRestore: [{ status: 'draft', publishedAt: null }] }
      })
      expect(await publicRead()).toHaveProperty('errors')
    }
    expect(
      await request('mutation { journeyPublish(id: "private") { status } }')
    ).toMatchObject({ data: { journeyPublish: { status: 'published' } } })
    vi.mocked(getUserFromPayload).mockReturnValue(null)
    expect(await publicRead()).toMatchObject({
      data: { journey: { title: 'PRIVATE HTTP SENTINEL' } }
    })
  })

  it('fences an old restore writer and preserves provenance across reconnect/redeploy', async () => {
    await expect(
      sql.query(
        `UPDATE "Journey" SET status = 'published', "publishedAt" = now() WHERE id = 'legacy-draft'`
      )
    ).rejects.toThrow('explicit provenance')
    await expect(
      sql.query(
        `UPDATE "Journey" SET "firstPublishedAt" = NULL WHERE id = 'legacy-public'`
      )
    ).rejects.toThrow('immutable')
    const second = new Client({ connectionString: databaseUrl })
    await second.connect()
    try {
      expect(
        (
          await second.query(
            `SELECT status, "firstPublishedAt" FROM "Journey" WHERE id = 'legacy-draft'`
          )
        ).rows
      ).toEqual([{ status: 'draft', firstPublishedAt: null }])
    } finally {
      await second.end()
    }
  })
})
