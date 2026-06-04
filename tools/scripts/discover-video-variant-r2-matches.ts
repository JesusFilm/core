import { createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Read-only discovery for legacy CloudFront VideoVariant.masterUrl rows that may
 * already have a matching CloudflareR2 master asset.
 *
 * Load the target env first, then run:
 *   set -a && source apis/api-media/.env.stage && set +a
 *   pnpm exec nx run api-media:discover-video-variant-r2-matches
 *
 * Outputs:
 *   .cache/arclight-video-variant-r2-discovery/<timestamp>/summary.json
 *   .cache/arclight-video-variant-r2-discovery/<timestamp>/matches.jsonl
 */

type MediaClient = InstanceType<typeof PrismaClient>

type PatternMap = Record<string, number>

type MatchBucket =
  | 'exactOne'
  | 'noMatch'
  | 'multipleMatches'
  | 'alreadyHasAsset'

interface Args {
  envFile: string | null
  outputDir: string
  host: string
  pageSize: number
  sampleLimit: number
}

interface DiscoveryRow {
  id: string
  slug: string
  videoId: string
  languageId: string
  edition: string
  masterUrl: string
  masterExtension: string | null
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  published: boolean
  createdAt: string
  updatedAt: string
  r2MatchCount: number
  r2AssetId: string | null
  r2PublicUrl: string | null
  r2FileName: string | null
  r2ContentType: string | null
  bucket: MatchBucket
}

interface RawDiscoveryRow {
  id: string
  slug: string
  videoId: string
  languageId: string
  edition: string
  masterUrl: string
  masterExtension: string | null
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  published: boolean
  createdAt: Date
  updatedAt: Date
  r2MatchCount: bigint | number
  r2AssetId: string | null
  r2PublicUrl: string | null
  r2FileName: string | null
  r2ContentType: string | null
}

interface Summary {
  generatedAt: string
  host: string
  outputDir: string
  counts: Record<MatchBucket, number>
  total: number
  byMasterExtension: PatternMap
  byEdition: PatternMap
  byMuxPresence: PatternMap
  byBrightcovePresence: PatternMap
  samples: Record<MatchBucket, DiscoveryRow[]>
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_PAGE_SIZE = 500
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    outputDir: path.resolve(
      '.cache/arclight-video-variant-r2-discovery',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    pageSize: DEFAULT_PAGE_SIZE,
    sampleLimit: DEFAULT_SAMPLE_LIMIT
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--env-file requires a path')
      args.envFile = path.resolve(value)
      index += 1
    } else if (arg === '--output-dir') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--output-dir requires a path')
      args.outputDir = path.resolve(value)
      index += 1
    } else if (arg === '--host') {
      const value = argv[index + 1]
      if (value == null)
        throw new Error('--host requires a CloudFront hostname')
      args.host = value
      index += 1
    } else if (arg === '--page-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--page-size requires a number')
      args.pageSize = Number(value)
      if (!Number.isInteger(args.pageSize) || args.pageSize < 1) {
        throw new Error('--page-size must be a positive integer')
      }
      index += 1
    } else if (arg === '--sample-limit') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--sample-limit requires a number')
      args.sampleLimit = Number(value)
      if (!Number.isInteger(args.sampleLimit) || args.sampleLimit < 1) {
        throw new Error('--sample-limit must be a positive integer')
      }
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function loadEnvFile(envFile: string | null): void {
  if (envFile == null) return

  const result = loadDotenv({ path: envFile, override: true })
  if (result.error != null) throw result.error
}

function requireEnv(name: string): string {
  const value = process.env[name]
  if (value == null || value === '') throw new Error(`Missing ${name}`)
  return value
}

function createMediaClient(connectionString: string): MediaClient {
  return new PrismaClient({
    adapter: new PrismaPg({
      connectionString,
      connectionTimeoutMillis: 30_000,
      idleTimeoutMillis: 30_000
    })
  })
}

function createSummary(args: Args): Summary {
  return {
    generatedAt: new Date().toISOString(),
    host: args.host,
    outputDir: args.outputDir,
    counts: {
      exactOne: 0,
      noMatch: 0,
      multipleMatches: 0,
      alreadyHasAsset: 0
    },
    total: 0,
    byMasterExtension: {},
    byEdition: {},
    byMuxPresence: {},
    byBrightcovePresence: {},
    samples: {
      exactOne: [],
      noMatch: [],
      multipleMatches: [],
      alreadyHasAsset: []
    }
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function bucketFor(row: RawDiscoveryRow): MatchBucket {
  if (row.assetId != null) return 'alreadyHasAsset'

  const count = Number(row.r2MatchCount)
  if (count === 1) return 'exactOne'
  if (count === 0) return 'noMatch'
  return 'multipleMatches'
}

function toDiscoveryRow(row: RawDiscoveryRow): DiscoveryRow {
  return {
    id: row.id,
    slug: row.slug,
    videoId: row.videoId,
    languageId: row.languageId,
    edition: row.edition,
    masterUrl: row.masterUrl,
    masterExtension: row.masterExtension,
    assetId: row.assetId,
    muxVideoId: row.muxVideoId,
    brightcoveId: row.brightcoveId,
    published: row.published,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    r2MatchCount: Number(row.r2MatchCount),
    r2AssetId: row.r2AssetId,
    r2PublicUrl: row.r2PublicUrl,
    r2FileName: row.r2FileName,
    r2ContentType: row.r2ContentType,
    bucket: bucketFor(row)
  }
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function discoverRows(
  prisma: MediaClient,
  host: string,
  pageSize: number,
  cursor: string | null
): Promise<RawDiscoveryRow[]> {
  const likeHost = `%${host}%`

  return prisma.$queryRawUnsafe<RawDiscoveryRow[]>(
    `
      WITH variants AS (
        SELECT
          vv.id,
          vv.slug,
          vv."videoId",
          vv."languageId",
          vv.edition,
          vv."masterUrl",
          CASE
            WHEN LOWER(vv."masterUrl") LIKE '%.mp4%' THEN '.mp4'
            WHEN LOWER(vv."masterUrl") LIKE '%.mov%' THEN '.mov'
            WHEN LOWER(vv."masterUrl") LIKE '%.m4v%' THEN '.m4v'
            ELSE NULL
          END AS "masterExtension",
          vv."assetId",
          vv."muxVideoId",
          vv."brightcoveId",
          vv.published,
          vv."createdAt",
          vv."updatedAt"
        FROM "VideoVariant" vv
        WHERE vv."masterUrl" LIKE $1
          AND ($2::text IS NULL OR vv.id > $2::text)
        ORDER BY vv.id ASC
        LIMIT $3
      )
      SELECT
        v.id,
        v.slug,
        v."videoId",
        v."languageId",
        v.edition,
        v."masterUrl",
        v."masterExtension",
        v."assetId",
        v."muxVideoId",
        v."brightcoveId",
        v.published,
        v."createdAt",
        v."updatedAt",
        COUNT(r2.id) AS "r2MatchCount",
        MIN(r2.id) AS "r2AssetId",
        MIN(r2."publicUrl") AS "r2PublicUrl",
        MIN(r2."fileName") AS "r2FileName",
        MIN(r2."contentType") AS "r2ContentType"
      FROM variants v
      LEFT JOIN "CloudflareR2" r2
        ON r2."videoId" = v."videoId"
        AND r2."publicUrl" IS NOT NULL
        AND LOWER(r2."fileName") LIKE LOWER(
          v."videoId" || '/variants/' || v."languageId" || '/videos/%/' ||
          v."languageId" || '_' || v."videoId" || COALESCE(v."masterExtension", '.mp4')
        )
      GROUP BY
        v.id,
        v.slug,
        v."videoId",
        v."languageId",
        v.edition,
        v."masterUrl",
        v."masterExtension",
        v."assetId",
        v."muxVideoId",
        v."brightcoveId",
        v.published,
        v."createdAt",
        v."updatedAt"
      ORDER BY v.id ASC
    `,
    likeHost,
    cursor,
    pageSize
  )
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  loadEnvFile(args.envFile)
  await mkdir(args.outputDir, { recursive: true })

  const prisma = createMediaClient(requireEnv('PG_DATABASE_URL_MEDIA'))
  const summary = createSummary(args)
  const matchesPath = path.join(args.outputDir, 'matches.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')
  const stream = createWriteStream(matchesPath, { encoding: 'utf-8' })

  try {
    let cursor: string | null = null

    while (true) {
      const rows = await discoverRows(prisma, args.host, args.pageSize, cursor)

      if (rows.length === 0) break

      for (const rawRow of rows) {
        const row = toDiscoveryRow(rawRow)
        summary.total += 1
        summary.counts[row.bucket] += 1
        increment(summary.byMasterExtension, row.masterExtension)
        increment(summary.byEdition, row.edition)
        increment(
          summary.byMuxPresence,
          row.muxVideoId == null ? 'missing muxVideoId' : 'has muxVideoId'
        )
        increment(
          summary.byBrightcovePresence,
          row.brightcoveId == null ? 'missing brightcoveId' : 'has brightcoveId'
        )

        if (summary.samples[row.bucket].length < args.sampleLimit) {
          summary.samples[row.bucket].push(row)
        }

        writeJsonLine(stream, row)
      }

      cursor = rows.at(-1)?.id ?? cursor
      console.info(
        `variants discovered=${summary.total} exactOne=${summary.counts.exactOne} noMatch=${summary.counts.noMatch} multipleMatches=${summary.counts.multipleMatches}`
      )
    }
  } finally {
    stream.end()
    await prisma.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== VIDEO VARIANT R2 DISCOVERY ===')
  console.info(`host: ${summary.host}`)
  console.info(`total: ${summary.total}`)
  console.info(`exactOne: ${summary.counts.exactOne}`)
  console.info(`noMatch: ${summary.counts.noMatch}`)
  console.info(`multipleMatches: ${summary.counts.multipleMatches}`)
  console.info(`alreadyHasAsset: ${summary.counts.alreadyHasAsset}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`matches export: ${matchesPath}`)
  console.info('')
  console.info('By master extension:')
  console.info(JSON.stringify(summary.byMasterExtension, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
