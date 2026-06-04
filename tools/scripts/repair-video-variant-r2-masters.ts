import { createReadStream, createWriteStream } from 'fs'
import { mkdir, writeFile } from 'fs/promises'
import path from 'path'
import readline from 'readline'

import { PrismaPg } from '@prisma/adapter-pg'
import { config as loadDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Repairs legacy CloudFront VideoVariant.masterUrl rows from a discovery export.
 *
 * Default is dry-run. Exact one-match rows use the exported R2 asset. Multiple
 * match rows query the newest matching R2 asset by createdAt, updatedAt, id.
 * No-match rows are left untouched for manual follow-up.
 *
 * Example:
 *   pnpm exec nx run api-media:repair-video-variant-r2-masters -- \
 *     --env-file apis/api-media/.env.prod \
 *     --input-file .cache/arclight-video-variant-r2-discovery/<run>/matches.jsonl
 *
 * Apply:
 *   pnpm exec nx run api-media:repair-video-variant-r2-masters -- \
 *     --env-file apis/api-media/.env.prod \
 *     --input-file .cache/arclight-video-variant-r2-discovery/<run>/matches.jsonl \
 *     --apply
 */

type MediaClient = InstanceType<typeof PrismaClient>

type PatternMap = Record<string, number>

type SourceBucket =
  | 'exactOne'
  | 'noMatch'
  | 'multipleMatches'
  | 'alreadyHasAsset'

type RepairBucket =
  | 'exactOne'
  | 'multipleNewest'
  | 'noMatch'
  | 'alreadyHasAsset'
  | 'missingR2'

interface Args {
  envFile: string | null
  inputFile: string | null
  apply: boolean
  outputDir: string
  host: string
  updateBatchSize: number
  includeMultiple: boolean
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
  r2MatchCount: number
  r2AssetId: string | null
  r2PublicUrl: string | null
  r2FileName: string | null
  r2ContentType: string | null
  bucket: SourceBucket
}

interface LatestR2Row {
  id: string
  publicUrl: string
  fileName: string
  contentType: string
  createdAt: Date
  updatedAt: Date
}

interface RepairRow extends DiscoveryRow {
  repairBucket: RepairBucket
  eligible: boolean
  selectedR2AssetId: string | null
  selectedR2PublicUrl: string | null
  selectedR2FileName: string | null
  selectedR2ContentType: string | null
  selectedR2CreatedAt: string | null
  selectedR2UpdatedAt: string | null
  updated: boolean
}

interface UpdateCandidate {
  id: string
  assetId: string
  publicUrl: string
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  inputFile: string
  outputDir: string
  includeMultiple: boolean
  scanned: number
  eligible: number
  updated: number
  skipped: number
  counts: Record<RepairBucket, number>
  byEdition: PatternMap
  byR2MatchCount: PatternMap
  samples: Record<RepairBucket, RepairRow[]>
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_UPDATE_BATCH_SIZE = 500
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    envFile: null,
    inputFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-video-variant-r2-repair',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    updateBatchSize: DEFAULT_UPDATE_BATCH_SIZE,
    includeMultiple: true,
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
    } else if (arg === '--update-batch-size') {
      const value = argv[index + 1]
      if (value == null)
        throw new Error('--update-batch-size requires a number')
      args.updateBatchSize = parsePositiveInteger('--update-batch-size', value)
      index += 1
    } else if (arg === '--exact-only') {
      args.includeMultiple = false
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
    throw new Error(
      '--input-file is required. Pass a discover-video-variant-r2-matches matches.jsonl export.'
    )
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
    includeMultiple: args.includeMultiple,
    scanned: 0,
    eligible: 0,
    updated: 0,
    skipped: 0,
    counts: {
      exactOne: 0,
      multipleNewest: 0,
      noMatch: 0,
      alreadyHasAsset: 0,
      missingR2: 0
    },
    byEdition: {},
    byR2MatchCount: {},
    samples: {
      exactOne: [],
      multipleNewest: [],
      noMatch: [],
      alreadyHasAsset: [],
      missingR2: []
    }
  }
}

function increment(map: PatternMap, key: string | number | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : String(key)
  map[normalized] = (map[normalized] ?? 0) + 1
}

function masterExtension(row: DiscoveryRow): string {
  return row.masterExtension ?? '.mp4'
}

async function findNewestR2(
  prisma: MediaClient,
  row: DiscoveryRow
): Promise<LatestR2Row | null> {
  const pattern = `${row.videoId}/variants/${row.languageId}/videos/%/${row.languageId}_${row.videoId}${masterExtension(row)}`
  const rows = await prisma.$queryRawUnsafe<LatestR2Row[]>(
    `
      SELECT
        r2.id,
        r2."publicUrl",
        r2."fileName",
        r2."contentType",
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
    pattern
  )

  return rows[0] ?? null
}

async function toRepairRow(
  prisma: MediaClient,
  row: DiscoveryRow,
  includeMultiple: boolean
): Promise<RepairRow> {
  if (row.bucket === 'alreadyHasAsset') {
    return buildRepairRow(row, 'alreadyHasAsset', false)
  }

  if (row.bucket === 'noMatch') {
    return buildRepairRow(row, 'noMatch', false)
  }

  if (row.bucket === 'exactOne') {
    const hasR2 = row.r2AssetId != null && row.r2PublicUrl != null
    return buildRepairRow(row, hasR2 ? 'exactOne' : 'missingR2', hasR2)
  }

  if (!includeMultiple) {
    return buildRepairRow(row, 'multipleNewest', false)
  }

  const newest = await findNewestR2(prisma, row)
  if (newest == null) return buildRepairRow(row, 'missingR2', false)

  return buildRepairRow(row, 'multipleNewest', true, newest)
}

function buildRepairRow(
  row: DiscoveryRow,
  repairBucket: RepairBucket,
  eligible: boolean,
  latestR2?: LatestR2Row
): RepairRow {
  return {
    ...row,
    repairBucket,
    eligible,
    selectedR2AssetId: latestR2?.id ?? row.r2AssetId,
    selectedR2PublicUrl: latestR2?.publicUrl ?? row.r2PublicUrl,
    selectedR2FileName: latestR2?.fileName ?? row.r2FileName,
    selectedR2ContentType: latestR2?.contentType ?? row.r2ContentType,
    selectedR2CreatedAt: latestR2?.createdAt.toISOString() ?? null,
    selectedR2UpdatedAt: latestR2?.updatedAt.toISOString() ?? null,
    updated: false
  }
}

function toUpdateCandidate(row: RepairRow): UpdateCandidate | null {
  if (!row.eligible) return null
  if (row.selectedR2AssetId == null || row.selectedR2PublicUrl == null) {
    return null
  }

  return {
    id: row.id,
    assetId: row.selectedR2AssetId,
    publicUrl: row.selectedR2PublicUrl
  }
}

async function updateRows(
  prisma: MediaClient,
  host: string,
  rows: RepairRow[]
): Promise<number> {
  const candidates = rows.flatMap((row) => {
    const candidate = toUpdateCandidate(row)
    return candidate == null ? [] : [candidate]
  })

  if (candidates.length === 0) return 0

  const values: string[] = []
  const params: string[] = []
  for (const candidate of candidates) {
    values.push(`($${params.length + 1}, $${params.length + 2}, $${params.length + 3})`)
    params.push(candidate.id, candidate.assetId, candidate.publicUrl)
  }

  params.push(`%${host}%`)
  const hostParam = `$${params.length}`

  const updated = await prisma.$queryRawUnsafe<Array<{ count: number | bigint }>>(
    `
      WITH input(id, "assetId", "publicUrl") AS (
        VALUES ${values.join(', ')}
      ), updated AS (
        UPDATE "VideoVariant" vv
        SET
          "assetId" = input."assetId",
          "masterUrl" = input."publicUrl",
          "updatedAt" = NOW()
        FROM input
        WHERE vv.id = input.id
          AND vv."assetId" IS NULL
          AND vv."masterUrl" LIKE ${hostParam}
          AND NOT EXISTS (
            SELECT 1
            FROM "VideoVariant" in_use
            WHERE in_use."assetId" = input."assetId"
              AND in_use.id <> vv.id
          )
        RETURNING vv.id
      )
      SELECT COUNT(*)::int AS count FROM updated
    `,
    ...params
  )

  return Number(updated[0]?.count ?? 0)
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function flushUpdates(
  prisma: MediaClient,
  args: Args,
  pending: RepairRow[],
  summary: Summary
): Promise<RepairRow[]> {
  if (!args.apply || pending.length === 0) return []

  summary.updated += await updateRows(prisma, args.host, pending)
  return []
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
    let pendingUpdates: RepairRow[] = []

    for await (const line of input) {
      if (line.trim() === '') continue

      const sourceRow = JSON.parse(line) as DiscoveryRow
      const row = await toRepairRow(prisma, sourceRow, args.includeMultiple)

      summary.scanned += 1
      summary.counts[row.repairBucket] += 1
      increment(summary.byEdition, row.edition)
      increment(summary.byR2MatchCount, row.r2MatchCount)

      if (row.eligible) {
        summary.eligible += 1
        pendingUpdates.push(row)
      } else {
        summary.skipped += 1
      }

      if (summary.samples[row.repairBucket].length < args.sampleLimit) {
        summary.samples[row.repairBucket].push(row)
      }

      if (pendingUpdates.length >= args.updateBatchSize) {
        pendingUpdates = await flushUpdates(prisma, args, pendingUpdates, summary)
      }

      writeJsonLine(output, row)

      if (summary.scanned % 1_000 === 0) {
        console.info(
          `variants scanned=${summary.scanned} eligible=${summary.eligible} updated=${summary.updated} noMatch=${summary.counts.noMatch} multipleNewest=${summary.counts.multipleNewest}`
        )
      }
    }

    pendingUpdates = await flushUpdates(prisma, args, pendingUpdates, summary)
    void pendingUpdates
  } finally {
    output.end()
    input.close()
    await prisma.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== VIDEO VARIANT R2 REPAIR ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`input: ${summary.inputFile}`)
  console.info(`scanned: ${summary.scanned}`)
  console.info(`eligible: ${summary.eligible}`)
  console.info(`updated: ${summary.updated}`)
  console.info(`skipped: ${summary.skipped}`)
  console.info(`exactOne: ${summary.counts.exactOne}`)
  console.info(`multipleNewest: ${summary.counts.multipleNewest}`)
  console.info(`noMatch: ${summary.counts.noMatch}`)
  console.info(`missingR2: ${summary.counts.missingR2}`)
  console.info(`alreadyHasAsset: ${summary.counts.alreadyHasAsset}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`rows export: ${rowsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
