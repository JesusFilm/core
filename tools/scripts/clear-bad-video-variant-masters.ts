import { createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

type MediaClient = InstanceType<typeof PrismaClient>
type PatternMap = Record<string, number>

interface Args {
  envFile: string | null
  apply: boolean
  outputDir: string
  host: string
  batchSize: number
  clearBatchSize: number
  sampleLimit: number
}

interface CandidateRow {
  id: string
  slug: string
  videoId: string
  languageId: string
  edition: string
  masterUrl: string
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  published: boolean
  createdAt: string
  updatedAt: string
}

interface RawCandidateRow extends Omit<CandidateRow, 'createdAt' | 'updatedAt'> {
  createdAt: Date
  updatedAt: Date
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  outputDir: string
  scanned: number
  candidates: number
  cleared: number
  byLanguageId: PatternMap
  byEdition: PatternMap
  byMuxPresence: PatternMap
  byBrightcovePresence: PatternMap
  samples: CandidateRow[]
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_BATCH_SIZE = 1_000
const DEFAULT_CLEAR_BATCH_SIZE = 500
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-clear-bad-video-variant-masters',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    batchSize: DEFAULT_BATCH_SIZE,
    clearBatchSize: DEFAULT_CLEAR_BATCH_SIZE,
    sampleLimit: DEFAULT_SAMPLE_LIMIT
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--apply') args.apply = true
    else if (arg === '--env-file') {
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
      if (value == null) throw new Error('--host requires a value')
      args.host = value
      index += 1
    } else if (arg === '--batch-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--batch-size requires a number')
      args.batchSize = parsePositiveInteger('--batch-size', value)
      index += 1
    } else if (arg === '--clear-batch-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--clear-batch-size requires a number')
      args.clearBatchSize = parsePositiveInteger('--clear-batch-size', value)
      index += 1
    } else if (arg === '--sample-limit') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--sample-limit requires a number')
      args.sampleLimit = parsePositiveInteger('--sample-limit', value)
      index += 1
    } else throw new Error(`Unknown argument: ${arg}`)
  }

  return args
}

function parsePositiveInteger(name: string, value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) throw new Error(`${name} must be a positive integer`)
  return parsed
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
    mode: args.apply ? 'apply' : 'dry-run',
    host: args.host,
    outputDir: args.outputDir,
    scanned: 0,
    candidates: 0,
    cleared: 0,
    byLanguageId: {},
    byEdition: {},
    byMuxPresence: {},
    byBrightcovePresence: {},
    samples: []
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function toCandidateRow(row: RawCandidateRow): CandidateRow {
  return {
    ...row,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString()
  }
}

async function fetchCandidates(
  prisma: MediaClient,
  host: string,
  batchSize: number,
  cursor: string | null
): Promise<RawCandidateRow[]> {
  return prisma.$queryRawUnsafe<RawCandidateRow[]>(
    `
      SELECT
        id,
        slug,
        "videoId",
        "languageId",
        edition,
        "masterUrl",
        "assetId",
        "muxVideoId",
        "brightcoveId",
        published,
        "createdAt",
        "updatedAt"
      FROM "VideoVariant"
      WHERE "masterUrl" LIKE $1
        AND "assetId" IS NULL
        AND ($2::text IS NULL OR id > $2::text)
      ORDER BY id ASC
      LIMIT $3
    `,
    `%${host}%`,
    cursor,
    batchSize
  )
}

async function clearBatch(
  prisma: MediaClient,
  host: string,
  ids: string[]
): Promise<number> {
  if (ids.length === 0) return 0
  const rows = await prisma.$queryRawUnsafe<Array<{ count: number | bigint }>>(
    `
      WITH payload(id) AS (
        SELECT unnest($1::text[])
      ), updated AS (
        UPDATE "VideoVariant" vv
        SET
          "masterUrl" = NULL,
          "updatedAt" = NOW()
        FROM payload
        WHERE vv.id = payload.id
          AND vv."assetId" IS NULL
          AND vv."masterUrl" LIKE $2
        RETURNING vv.id
      )
      SELECT COUNT(*)::int AS count FROM updated
    `,
    ids,
    `%${host}%`
  )
  return Number(rows[0]?.count ?? 0)
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  loadEnvFile(args.envFile)
  await mkdir(args.outputDir, { recursive: true })

  const prisma = createMediaClient(requireEnv('PG_DATABASE_URL_MEDIA'))
  const summary = createSummary(args)
  const rowsPath = path.join(args.outputDir, 'candidates.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')
  const stream = createWriteStream(rowsPath, { encoding: 'utf-8' })

  try {
    let cursor: string | null = null
    let pendingIds: string[] = []

    while (true) {
      const rows = await fetchCandidates(prisma, args.host, args.batchSize, cursor)
      if (rows.length === 0) break

      for (const rawRow of rows) {
        const row = toCandidateRow(rawRow)
        summary.scanned += 1
        summary.candidates += 1
        increment(summary.byLanguageId, row.languageId)
        increment(summary.byEdition, row.edition)
        increment(summary.byMuxPresence, row.muxVideoId == null ? 'missing muxVideoId' : 'has muxVideoId')
        increment(summary.byBrightcovePresence, row.brightcoveId == null ? 'missing brightcoveId' : 'has brightcoveId')
        if (summary.samples.length < args.sampleLimit) summary.samples.push(row)
        pendingIds.push(row.id)
        writeJsonLine(stream, row)

        if (args.apply && pendingIds.length >= args.clearBatchSize) {
          summary.cleared += await clearBatch(prisma, args.host, pendingIds)
          pendingIds = []
        }
      }

      cursor = rows.at(-1)?.id ?? cursor
      console.info(`variants scanned=${summary.scanned} candidates=${summary.candidates} cleared=${summary.cleared}`)
    }

    if (args.apply && pendingIds.length > 0) {
      summary.cleared += await clearBatch(prisma, args.host, pendingIds)
    }
  } finally {
    stream.end()
    await prisma.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== CLEAR BAD VIDEO VARIANT MASTERS ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`candidates: ${summary.candidates}`)
  console.info(`cleared: ${summary.cleared}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`candidates export: ${rowsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
