import { createReadStream, createWriteStream } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline'

import { PrismaPg } from '@prisma/adapter-pg'
import { parse as parseDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

type MediaClient = InstanceType<typeof PrismaClient>
type PatternMap = Record<string, number>
type Bucket = 'matchedDownload' | 'noDownloadMatch' | 'stageAlreadyHasAsset'

interface Args {
  stageEnvFile: string | null
  prodEnvFile: string | null
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
  assetId: string | null
  muxVideoId: string | null
  brightcoveId: string | null
  published: boolean
}

interface R2Row {
  id: string
  fileName: string
  originalFilename: string | null
  uploadUrl: string | null
  userId: string
  publicUrl: string
  videoId: string | null
  contentType: string
  contentLength: bigint | number
  createdAt: Date
  updatedAt: Date
}

interface SyncRow extends BrokenVariantRow {
  bucket: Bucket
  selectedR2AssetId: string | null
  selectedR2PublicUrl: string | null
  selectedR2FileName: string | null
  selectedR2ContentLength: string | null
  updated: boolean
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  inputFile: string
  outputDir: string
  scanned: number
  matched: number
  updated: number
  skipped: number
  counts: Record<Bucket, number>
  byLanguageId: PatternMap
  byEdition: PatternMap
  samples: Record<Bucket, SyncRow[]>
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    stageEnvFile: null,
    prodEnvFile: null,
    inputFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-stage-video-variant-r2-download-fallback-sync',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    sampleLimit: DEFAULT_SAMPLE_LIMIT
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--apply') args.apply = true
    else if (arg === '--stage-env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--stage-env-file requires a path')
      args.stageEnvFile = path.resolve(value)
      index += 1
    } else if (arg === '--prod-env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--prod-env-file requires a path')
      args.prodEnvFile = path.resolve(value)
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
      args.sampleLimit = Number(value)
      index += 1
    } else throw new Error(`Unknown argument: ${arg}`)
  }

  return args
}

async function readEnvFile(envFile: string | null, label: string): Promise<Record<string, string>> {
  if (envFile == null) throw new Error(`${label} env file is required`)
  return parseDotenv(await readFile(envFile, 'utf-8'))
}

function requireEnv(env: Record<string, string>, name: string, label: string): string {
  const value = env[name]
  if (value == null || value === '') throw new Error(`Missing ${name} in ${label}`)
  return value
}

function requireInputFile(inputFile: string | null): string {
  if (inputFile == null) throw new Error('--input-file is required')
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
    matched: 0,
    updated: 0,
    skipped: 0,
    counts: { matchedDownload: 0, noDownloadMatch: 0, stageAlreadyHasAsset: 0 },
    byLanguageId: {},
    byEdition: {},
    samples: { matchedDownload: [], noDownloadMatch: [], stageAlreadyHasAsset: [] }
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function downloadPatterns(row: BrokenVariantRow): string[] {
  const slugPart = row.videoId.replace(/^\d+_/, '')
  return [
    `${row.videoId}/variants/${row.languageId}/downloads/%${row.languageId}%${slugPart}%_high.mp4`,
    `${row.videoId}/variants/${row.languageId}/downloads/%${row.languageId}%${slugPart}%_distroHigh.mp4`,
    `${row.videoId}/variants/${row.languageId}/downloads/%_high.mp4`,
    `${row.videoId}/variants/${row.languageId}/downloads/%_distroHigh.mp4`
  ]
}

async function findProdDownload(prod: MediaClient, row: BrokenVariantRow): Promise<R2Row | null> {
  for (const pattern of downloadPatterns(row)) {
    const rows = await prod.$queryRawUnsafe<R2Row[]>(
      `
        SELECT
          id,
          "fileName",
          "originalFilename",
          "uploadUrl",
          "userId",
          "publicUrl",
          "videoId",
          "contentType",
          "contentLength",
          "createdAt",
          "updatedAt"
        FROM "CloudflareR2"
        WHERE "videoId" = $1
          AND "publicUrl" IS NOT NULL
          AND LOWER("fileName") LIKE LOWER($2)
        ORDER BY
          CASE WHEN LOWER("fileName") LIKE '%distrohigh.mp4' THEN 0 ELSE 1 END,
          "createdAt" DESC,
          "updatedAt" DESC,
          id DESC
        LIMIT 1
      `,
      row.videoId,
      pattern
    )
    if (rows[0] != null) return rows[0]
  }

  return null
}

function toSyncRow(row: BrokenVariantRow, r2: R2Row | null): SyncRow {
  if (row.assetId != null) {
    return buildSyncRow(row, 'stageAlreadyHasAsset', null)
  }
  if (r2 == null) return buildSyncRow(row, 'noDownloadMatch', null)
  return buildSyncRow(row, 'matchedDownload', r2)
}

function buildSyncRow(row: BrokenVariantRow, bucket: Bucket, r2: R2Row | null): SyncRow {
  return {
    ...row,
    bucket,
    selectedR2AssetId: r2?.id ?? null,
    selectedR2PublicUrl: r2?.publicUrl ?? null,
    selectedR2FileName: r2?.fileName ?? null,
    selectedR2ContentLength: r2?.contentLength.toString() ?? null,
    updated: false
  }
}

async function upsertR2(stage: MediaClient, r2: R2Row): Promise<void> {
  await stage.$executeRaw`
    INSERT INTO "CloudflareR2" (
      id,
      "fileName",
      "originalFilename",
      "uploadUrl",
      "userId",
      "publicUrl",
      "videoId",
      "contentType",
      "contentLength",
      "createdAt",
      "updatedAt"
    ) VALUES (
      ${r2.id},
      ${r2.fileName},
      ${r2.originalFilename},
      ${r2.uploadUrl},
      ${r2.userId},
      ${r2.publicUrl},
      ${r2.videoId},
      ${r2.contentType},
      ${r2.contentLength},
      ${r2.createdAt},
      ${r2.updatedAt}
    )
    ON CONFLICT (id) DO UPDATE SET
      "fileName" = EXCLUDED."fileName",
      "originalFilename" = EXCLUDED."originalFilename",
      "uploadUrl" = EXCLUDED."uploadUrl",
      "userId" = EXCLUDED."userId",
      "publicUrl" = EXCLUDED."publicUrl",
      "videoId" = EXCLUDED."videoId",
      "contentType" = EXCLUDED."contentType",
      "contentLength" = EXCLUDED."contentLength",
      "updatedAt" = EXCLUDED."updatedAt"
  `
}

async function updateStageVariant(
  stage: MediaClient,
  host: string,
  row: BrokenVariantRow,
  r2: R2Row
): Promise<number> {
  const updated = await stage.$executeRaw`
    UPDATE "VideoVariant"
    SET
      "assetId" = ${r2.id},
      "masterUrl" = ${r2.publicUrl},
      "updatedAt" = NOW()
    WHERE id = ${row.id}
      AND "assetId" IS NULL
      AND "masterUrl" LIKE ${`%${host}%`}
      AND NOT EXISTS (
        SELECT 1
        FROM "VideoVariant" in_use
        WHERE in_use."assetId" = ${r2.id}
          AND in_use.id <> ${row.id}
      )
  `
  return Number(updated)
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const inputFile = requireInputFile(args.inputFile)
  const stageEnv = await readEnvFile(args.stageEnvFile, 'stage')
  const prodEnv = await readEnvFile(args.prodEnvFile, 'prod')
  await mkdir(args.outputDir, { recursive: true })

  const stage = createMediaClient(requireEnv(stageEnv, 'PG_DATABASE_URL_MEDIA', 'stage'))
  const prod = createMediaClient(requireEnv(prodEnv, 'PG_DATABASE_URL_MEDIA', 'prod'))
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
      const r2 = await findProdDownload(prod, sourceRow)
      const row = toSyncRow(sourceRow, r2)
      summary.scanned += 1
      summary.counts[row.bucket] += 1
      increment(summary.byLanguageId, row.languageId)
      increment(summary.byEdition, row.edition)

      if (row.bucket === 'matchedDownload' && r2 != null) {
        summary.matched += 1
        if (args.apply) {
          await upsertR2(stage, r2)
          const updated = await updateStageVariant(stage, args.host, sourceRow, r2)
          row.updated = updated === 1
          summary.updated += updated
        }
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
    await prod.$disconnect()
    await stage.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== STAGE VIDEO VARIANT R2 DOWNLOAD FALLBACK SYNC FROM PROD ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`input: ${summary.inputFile}`)
  console.info(`scanned: ${summary.scanned}`)
  console.info(`matched: ${summary.matched}`)
  console.info(`updated: ${summary.updated}`)
  console.info(`skipped: ${summary.skipped}`)
  console.info(`matchedDownload: ${summary.counts.matchedDownload}`)
  console.info(`noDownloadMatch: ${summary.counts.noDownloadMatch}`)
  console.info(`stageAlreadyHasAsset: ${summary.counts.stageAlreadyHasAsset}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`rows export: ${rowsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
