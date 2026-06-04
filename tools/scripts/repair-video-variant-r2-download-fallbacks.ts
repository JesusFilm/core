import { createReadStream, createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Repairs the last legacy VideoVariant.masterUrl rows when the only R2 match is
 * an existing download rendition. This is intentionally separate from the main
 * master repair and requires an explicit broken-ref export input.
 *
 * Default is dry-run. It picks _high.mp4 first, then newest matching download.
 */

type MediaClient = InstanceType<typeof PrismaClient>

type PatternMap = Record<string, number>

type Bucket = 'matchedHighDownload' | 'noDownloadMatch' | 'alreadyHasAsset'

interface Args {
  envFile: string | null
  inputFile: string | null
  apply: boolean
  outputDir: string
  host: string
  sampleLimit: number
}

interface BrokenVariantRow {
  id: string
  slug: string
  videoId: string
  languageId: string
  edition: string
  masterUrl: string
  targetHost?: string | null
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  published: boolean
}

interface R2Row {
  id: string
  publicUrl: string
  fileName: string
  contentType: string
  contentLength: bigint | number
  createdAt: Date
  updatedAt: Date
}

interface RepairRow extends BrokenVariantRow {
  bucket: Bucket
  eligible: boolean
  selectedR2AssetId: string | null
  selectedR2PublicUrl: string | null
  selectedR2FileName: string | null
  selectedR2ContentType: string | null
  selectedR2ContentLength: string | null
  selectedR2CreatedAt: string | null
  selectedR2UpdatedAt: string | null
  updated: boolean
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  inputFile: string
  outputDir: string
  scanned: number
  eligible: number
  updated: number
  skipped: number
  counts: Record<Bucket, number>
  byLanguageId: PatternMap
  byEdition: PatternMap
  samples: Record<Bucket, RepairRow[]>
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    inputFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-video-variant-r2-download-fallback-repair',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    sampleLimit: DEFAULT_SAMPLE_LIMIT
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      args.apply = true
    } else if (arg === '--env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--env-file requires a path')
      args.envFile = path.resolve(value)
      index += 1
    } else if (arg === '--input-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--input-file requires a path')
      args.inputFile = path.resolve(value)
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
    } else if (arg === '--sample-limit') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--sample-limit requires a number')
      args.sampleLimit = parsePositiveInteger('--sample-limit', value)
      index += 1
    } else {
      throw new Error(`Unknown argument: ${arg}`)
    }
  }

  return args
}

function parsePositiveInteger(name: string, value: string): number {
  const parsed = Number(value)
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer`)
  }
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

function requireInputFile(inputFile: string | null): string {
  if (inputFile == null) {
    throw new Error('--input-file is required. Pass export-broken-media-prod-refs video-variants.jsonl.')
  }
  return inputFile
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

function createSummary(args: Args, inputFile: string): Summary {
  return {
    generatedAt: new Date().toISOString(),
    mode: args.apply ? 'apply' : 'dry-run',
    host: args.host,
    inputFile,
    outputDir: args.outputDir,
    scanned: 0,
    eligible: 0,
    updated: 0,
    skipped: 0,
    counts: {
      matchedHighDownload: 0,
      noDownloadMatch: 0,
      alreadyHasAsset: 0
    },
    byLanguageId: {},
    byEdition: {},
    samples: {
      matchedHighDownload: [],
      noDownloadMatch: [],
      alreadyHasAsset: []
    }
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function buildDownloadPattern(row: BrokenVariantRow): string {
  return `${row.videoId}/variants/${row.languageId}/downloads/%${row.languageId}%${row.videoId.replace(/^\d+_/, '')}%_high.mp4`
}

function buildFallbackDownloadPattern(row: BrokenVariantRow): string {
  return `${row.videoId}/variants/${row.languageId}/downloads/%_high.mp4`
}

async function findHighDownload(
  prisma: MediaClient,
  row: BrokenVariantRow
): Promise<R2Row | null> {
  const rows = await prisma.$queryRawUnsafe<R2Row[]>(
    `
      SELECT
        r2.id,
        r2."publicUrl",
        r2."fileName",
        r2."contentType",
        r2."contentLength",
        r2."createdAt",
        r2."updatedAt"
      FROM "CloudflareR2" r2
      WHERE r2."videoId" = $1
        AND r2."publicUrl" IS NOT NULL
        AND LOWER(r2."fileName") LIKE LOWER($2)
      ORDER BY r2."createdAt" DESC, r2."updatedAt" DESC, r2.id DESC
      LIMIT 1
    `,
    row.videoId,
    buildDownloadPattern(row)
  )

  if (rows[0] != null) return rows[0]

  const fallbackRows = await prisma.$queryRawUnsafe<R2Row[]>(
    `
      SELECT
        r2.id,
        r2."publicUrl",
        r2."fileName",
        r2."contentType",
        r2."contentLength",
        r2."createdAt",
        r2."updatedAt"
      FROM "CloudflareR2" r2
      WHERE r2."videoId" = $1
        AND r2."publicUrl" IS NOT NULL
        AND LOWER(r2."fileName") LIKE LOWER($2)
      ORDER BY r2."createdAt" DESC, r2."updatedAt" DESC, r2.id DESC
      LIMIT 1
    `,
    row.videoId,
    buildFallbackDownloadPattern(row)
  )

  return fallbackRows[0] ?? null
}

async function toRepairRow(
  prisma: MediaClient,
  row: BrokenVariantRow
): Promise<RepairRow> {
  if (row.assetId != null) {
    return buildRepairRow(row, 'alreadyHasAsset', false)
  }

  const r2 = await findHighDownload(prisma, row)
  if (r2 == null) return buildRepairRow(row, 'noDownloadMatch', false)

  return buildRepairRow(row, 'matchedHighDownload', true, r2)
}

function buildRepairRow(
  row: BrokenVariantRow,
  bucket: Bucket,
  eligible: boolean,
  r2?: R2Row
): RepairRow {
  return {
    ...row,
    bucket,
    eligible,
    selectedR2AssetId: r2?.id ?? null,
    selectedR2PublicUrl: r2?.publicUrl ?? null,
    selectedR2FileName: r2?.fileName ?? null,
    selectedR2ContentType: r2?.contentType ?? null,
    selectedR2ContentLength: r2?.contentLength?.toString() ?? null,
    selectedR2CreatedAt: r2?.createdAt.toISOString() ?? null,
    selectedR2UpdatedAt: r2?.updatedAt.toISOString() ?? null,
    updated: false
  }
}

async function updateRow(
  prisma: MediaClient,
  host: string,
  row: RepairRow
): Promise<number> {
  if (row.selectedR2AssetId == null || row.selectedR2PublicUrl == null) return 0

  const updated = await prisma.$executeRaw`
    UPDATE "VideoVariant"
    SET
      "assetId" = ${row.selectedR2AssetId},
      "masterUrl" = ${row.selectedR2PublicUrl},
      "updatedAt" = NOW()
    WHERE id = ${row.id}
      AND "assetId" IS NULL
      AND "masterUrl" LIKE ${`%${host}%`}
      AND NOT EXISTS (
        SELECT 1
        FROM "VideoVariant" in_use
        WHERE in_use."assetId" = ${row.selectedR2AssetId}
          AND in_use.id <> ${row.id}
      )
  `

  row.updated = Number(updated) === 1
  return Number(updated)
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const inputFile = requireInputFile(args.inputFile)
  loadEnvFile(args.envFile)
  await mkdir(args.outputDir, { recursive: true })

  const prisma = createMediaClient(requireEnv('PG_DATABASE_URL_MEDIA'))
  const summary = createSummary(args, inputFile)
  const rowsPath = path.join(args.outputDir, 'rows.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')
  const output = createWriteStream(rowsPath, { encoding: 'utf-8' })
  const input = readline.createInterface({
    input: createReadStream(inputFile, { encoding: 'utf-8' }),
    crlfDelay: Infinity
  })

  try {
    for await (const line of input) {
      if (line.trim() === '') continue

      const sourceRow = JSON.parse(line) as BrokenVariantRow
      const row = await toRepairRow(prisma, sourceRow)

      summary.scanned += 1
      summary.counts[row.bucket] += 1
      increment(summary.byLanguageId, row.languageId)
      increment(summary.byEdition, row.edition)

      if (row.eligible) {
        summary.eligible += 1
        if (args.apply) summary.updated += await updateRow(prisma, args.host, row)
      } else {
        summary.skipped += 1
      }

      if (summary.samples[row.bucket].length < args.sampleLimit) {
        summary.samples[row.bucket].push(row)
      }

      writeJsonLine(output, row)
    }
  } finally {
    output.end()
    input.close()
    await prisma.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== VIDEO VARIANT R2 DOWNLOAD FALLBACK REPAIR ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`input: ${summary.inputFile}`)
  console.info(`scanned: ${summary.scanned}`)
  console.info(`eligible: ${summary.eligible}`)
  console.info(`updated: ${summary.updated}`)
  console.info(`skipped: ${summary.skipped}`)
  console.info(`matchedHighDownload: ${summary.counts.matchedHighDownload}`)
  console.info(`noDownloadMatch: ${summary.counts.noDownloadMatch}`)
  console.info(`alreadyHasAsset: ${summary.counts.alreadyHasAsset}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`rows export: ${rowsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
