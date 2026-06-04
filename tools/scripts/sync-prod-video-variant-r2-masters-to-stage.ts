import { createWriteStream } from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { PrismaPg } from '@prisma/adapter-pg'
import { parse as parseDotenv } from 'dotenv'

import { PrismaClient } from '../../libs/prisma/media/src/__generated__/client/client'

/*
 * Copies repaired prod VideoVariant master assets into stage.
 *
 * Stage has legacy CloudFront masterUrl rows, but the matching CloudflareR2 rows
 * often only exist in prod. This script reads stage broken rows, looks up the
 * same VideoVariant IDs in prod, upserts prod CloudflareR2 asset rows into stage,
 * then updates stage VideoVariant.assetId/masterUrl.
 *
 * Default is dry-run.
 */

type MediaClient = InstanceType<typeof PrismaClient>
type PatternMap = Record<string, number>

type Bucket =
  | 'repairable'
  | 'missingProdVariant'
  | 'missingProdAsset'
  | 'stageAlreadyHasAsset'
  | 'unchanged'

interface Args {
  stageEnvFile: string | null
  prodEnvFile: string | null
  apply: boolean
  outputDir: string
  host: string
  batchSize: number
  writeBatchSize: number
  sampleLimit: number
}

interface StageVariantRow {
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

interface ProdRepairRow {
  id: string
  masterUrl: string | null
  assetId: string | null
  r2Id: string | null
  r2FileName: string | null
  r2OriginalFilename: string | null
  r2UploadUrl: string | null
  r2UserId: string | null
  r2PublicUrl: string | null
  r2VideoId: string | null
  r2ContentType: string | null
  r2ContentLength: bigint | number | null
  r2CreatedAt: Date | null
  r2UpdatedAt: Date | null
}

interface SyncRow extends StageVariantRow {
  bucket: Bucket
  prodMasterUrl: string | null
  prodAssetId: string | null
  r2FileName: string | null
  r2PublicUrl: string | null
  r2ContentType: string | null
  r2ContentLength: string | null
  updated: boolean
}

interface RepairCandidate {
  stage: StageVariantRow
  prod: ProdRepairRow
}

interface Summary {
  generatedAt: string
  mode: 'dry-run' | 'apply'
  host: string
  outputDir: string
  scanned: number
  repairable: number
  updated: number
  skipped: number
  counts: Record<Bucket, number>
  byLanguageId: PatternMap
  byEdition: PatternMap
  samples: Record<Bucket, SyncRow[]>
}

const DEFAULT_HOST = 'd2b2n918ty14xg.cloudfront.net'
const DEFAULT_BATCH_SIZE = 500
const DEFAULT_WRITE_BATCH_SIZE = 250
const DEFAULT_SAMPLE_LIMIT = 20

function parseArgs(argv: string[]): Args {
  const args: Args = {
    stageEnvFile: null,
    prodEnvFile: null,
    apply: false,
    outputDir: path.resolve(
      '.cache/arclight-stage-video-variant-r2-sync',
      new Date().toISOString().replace(/[:.]/g, '-')
    ),
    host: DEFAULT_HOST,
    batchSize: DEFAULT_BATCH_SIZE,
    writeBatchSize: DEFAULT_WRITE_BATCH_SIZE,
    sampleLimit: DEFAULT_SAMPLE_LIMIT
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--apply') {
      args.apply = true
    } else if (arg === '--stage-env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--stage-env-file requires a path')
      args.stageEnvFile = path.resolve(value)
      index += 1
    } else if (arg === '--prod-env-file') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--prod-env-file requires a path')
      args.prodEnvFile = path.resolve(value)
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
    } else if (arg === '--write-batch-size') {
      const value = argv[index + 1]
      if (value == null) throw new Error('--write-batch-size requires a number')
      args.writeBatchSize = parsePositiveInteger('--write-batch-size', value)
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

async function readEnvFile(envFile: string | null, label: string): Promise<Record<string, string>> {
  if (envFile == null) throw new Error(`${label} env file is required`)
  return parseDotenv(await readFile(envFile, 'utf-8'))
}

function requireEnv(env: Record<string, string>, name: string, label: string): string {
  const value = env[name]
  if (value == null || value === '') throw new Error(`Missing ${name} in ${label}`)
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
    repairable: 0,
    updated: 0,
    skipped: 0,
    counts: {
      repairable: 0,
      missingProdVariant: 0,
      missingProdAsset: 0,
      stageAlreadyHasAsset: 0,
      unchanged: 0
    },
    byLanguageId: {},
    byEdition: {},
    samples: {
      repairable: [],
      missingProdVariant: [],
      missingProdAsset: [],
      stageAlreadyHasAsset: [],
      unchanged: []
    }
  }
}

function increment(map: PatternMap, key: string | null | undefined): void {
  const normalized = key == null || key === '' ? '(blank)' : key
  map[normalized] = (map[normalized] ?? 0) + 1
}

function placeholders(rowCount: number, columnCount: number, casts: string[]): string {
  return Array.from({ length: rowCount }, (_, rowIndex) => {
    const rowPlaceholders = Array.from({ length: columnCount }, (_, columnIndex) => {
      const placeholderIndex = rowIndex * columnCount + columnIndex + 1
      return `$${placeholderIndex}${casts[columnIndex] ?? ''}`
    })
    return `(${rowPlaceholders.join(', ')})`
  }).join(', ')
}

async function fetchStageRows(
  stage: MediaClient,
  host: string,
  batchSize: number,
  cursor: string | null
): Promise<StageVariantRow[]> {
  return stage.$queryRawUnsafe<StageVariantRow[]>(
    `
      SELECT
        vv.id,
        vv.slug,
        vv."videoId",
        vv."languageId",
        vv.edition,
        vv."masterUrl",
        vv."assetId",
        vv."muxVideoId",
        vv."brightcoveId",
        vv.published
      FROM "VideoVariant" vv
      WHERE vv."masterUrl" LIKE $1
        AND ($2::text IS NULL OR vv.id > $2::text)
      ORDER BY vv.id ASC
      LIMIT $3
    `,
    `%${host}%`,
    cursor,
    batchSize
  )
}

async function fetchProdRepairs(
  prod: MediaClient,
  ids: string[]
): Promise<Map<string, ProdRepairRow>> {
  if (ids.length === 0) return new Map()

  const rows = await prod.$queryRawUnsafe<ProdRepairRow[]>(
    `
      SELECT
        vv.id,
        vv."masterUrl",
        vv."assetId",
        r2.id AS "r2Id",
        r2."fileName" AS "r2FileName",
        r2."originalFilename" AS "r2OriginalFilename",
        r2."uploadUrl" AS "r2UploadUrl",
        r2."userId" AS "r2UserId",
        r2."publicUrl" AS "r2PublicUrl",
        r2."videoId" AS "r2VideoId",
        r2."contentType" AS "r2ContentType",
        r2."contentLength" AS "r2ContentLength",
        r2."createdAt" AS "r2CreatedAt",
        r2."updatedAt" AS "r2UpdatedAt"
      FROM "VideoVariant" vv
      LEFT JOIN "CloudflareR2" r2 ON r2.id = vv."assetId"
      WHERE vv.id = ANY($1::text[])
    `,
    ids
  )

  return new Map(rows.map((row) => [row.id, row]))
}

function toSyncRow(stage: StageVariantRow, prod: ProdRepairRow | undefined): SyncRow {
  if (stage.assetId != null) {
    return buildSyncRow(stage, prod, 'stageAlreadyHasAsset')
  }

  if (prod == null) return buildSyncRow(stage, prod, 'missingProdVariant')

  const hasProdRepair =
    prod.assetId != null &&
    prod.r2Id != null &&
    prod.r2PublicUrl != null &&
    prod.masterUrl != null &&
    !prod.masterUrl.includes(DEFAULT_HOST)

  if (!hasProdRepair) return buildSyncRow(stage, prod, 'missingProdAsset')

  if (stage.assetId === prod.assetId && stage.masterUrl === prod.masterUrl) {
    return buildSyncRow(stage, prod, 'unchanged')
  }

  return buildSyncRow(stage, prod, 'repairable')
}

function buildSyncRow(
  stage: StageVariantRow,
  prod: ProdRepairRow | undefined,
  bucket: Bucket
): SyncRow {
  return {
    ...stage,
    bucket,
    prodMasterUrl: prod?.masterUrl ?? null,
    prodAssetId: prod?.assetId ?? null,
    r2FileName: prod?.r2FileName ?? null,
    r2PublicUrl: prod?.r2PublicUrl ?? null,
    r2ContentType: prod?.r2ContentType ?? null,
    r2ContentLength: prod?.r2ContentLength?.toString() ?? null,
    updated: false
  }
}

function toRepairCandidate(
  row: StageVariantRow,
  prod: ProdRepairRow | undefined
): RepairCandidate | null {
  const syncRow = toSyncRow(row, prod)
  return syncRow.bucket === 'repairable' && prod != null ? { stage: row, prod } : null
}

async function applyCandidates(
  stage: MediaClient,
  host: string,
  candidates: RepairCandidate[]
): Promise<number> {
  if (candidates.length === 0) return 0

  await upsertR2Rows(stage, candidates.map(({ prod }) => prod))
  return updateStageVariants(stage, host, candidates)
}

async function upsertR2Rows(stage: MediaClient, rows: ProdRepairRow[]): Promise<void> {
  const params = rows.flatMap((row) => [
    row.r2Id,
    row.r2FileName,
    row.r2OriginalFilename,
    row.r2UploadUrl,
    row.r2UserId ?? 'system',
    row.r2PublicUrl,
    row.r2VideoId,
    row.r2ContentType ?? 'application/octet-stream',
    row.r2ContentLength?.toString() ?? '0',
    row.r2CreatedAt,
    row.r2UpdatedAt
  ])

  await stage.$executeRawUnsafe(
    `
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
      )
      VALUES ${placeholders(rows.length, 11, [
        '::text',
        '::text',
        '::text',
        '::text',
        '::text',
        '::text',
        '::text',
        '::text',
        '::bigint',
        '::timestamp',
        '::timestamp'
      ])}
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
    `,
    ...params
  )
}

async function updateStageVariants(
  stage: MediaClient,
  host: string,
  candidates: RepairCandidate[]
): Promise<number> {
  const params = candidates.flatMap(({ stage, prod }) => [stage.id, prod.assetId, prod.masterUrl])
  params.push(`%${host}%`)
  const hostParam = `$${params.length}`

  const rows = await stage.$queryRawUnsafe<Array<{ count: number | bigint }>>(
    `
      WITH payload(id, "assetId", "masterUrl") AS (
        VALUES ${placeholders(candidates.length, 3, ['::text', '::text', '::text'])}
      ), updated AS (
        UPDATE "VideoVariant" vv
        SET
          "assetId" = payload."assetId",
          "masterUrl" = payload."masterUrl",
          "updatedAt" = NOW()
        FROM payload
        WHERE vv.id = payload.id
          AND vv."assetId" IS NULL
          AND vv."masterUrl" LIKE ${hostParam}
          AND NOT EXISTS (
            SELECT 1
            FROM "VideoVariant" in_use
            WHERE in_use."assetId" = payload."assetId"
              AND in_use.id <> vv.id
          )
        RETURNING vv.id
      )
      SELECT COUNT(*)::int AS count FROM updated
    `,
    ...params
  )

  return Number(rows[0]?.count ?? 0)
}

function writeJsonLine(stream: NodeJS.WritableStream, row: unknown): void {
  stream.write(`${JSON.stringify(row)}\n`)
}

async function main(): Promise<void> {
  const args = parseArgs(process.argv.slice(2))
  const stageEnv = await readEnvFile(args.stageEnvFile, 'stage')
  const prodEnv = await readEnvFile(args.prodEnvFile, 'prod')
  await mkdir(args.outputDir, { recursive: true })

  const stage = createMediaClient(requireEnv(stageEnv, 'PG_DATABASE_URL_MEDIA', 'stage'))
  const prod = createMediaClient(requireEnv(prodEnv, 'PG_DATABASE_URL_MEDIA', 'prod'))
  const summary = createSummary(args)
  const rowsPath = path.join(args.outputDir, 'rows.jsonl')
  const summaryPath = path.join(args.outputDir, 'summary.json')
  const stream = createWriteStream(rowsPath, { encoding: 'utf-8' })

  try {
    let cursor: string | null = null
    let pending: RepairCandidate[] = []

    while (true) {
      const stageRows = await fetchStageRows(stage, args.host, args.batchSize, cursor)
      if (stageRows.length === 0) break

      const prodRows = await fetchProdRepairs(prod, stageRows.map((row) => row.id))

      for (const stageRow of stageRows) {
        const prodRow = prodRows.get(stageRow.id)
        const syncRow = toSyncRow(stageRow, prodRow)
        summary.scanned += 1
        summary.counts[syncRow.bucket] += 1
        increment(summary.byLanguageId, syncRow.languageId)
        increment(summary.byEdition, syncRow.edition)

        if (syncRow.bucket === 'repairable') {
          summary.repairable += 1
          const candidate = toRepairCandidate(stageRow, prodRow)
          if (candidate != null) pending.push(candidate)
        } else {
          summary.skipped += 1
        }

        if (summary.samples[syncRow.bucket].length < args.sampleLimit) {
          summary.samples[syncRow.bucket].push(syncRow)
        }

        writeJsonLine(stream, syncRow)
      }

      if (args.apply && pending.length >= args.writeBatchSize) {
        summary.updated += await applyCandidates(stage, args.host, pending)
        pending = []
      }

      cursor = stageRows.at(-1)?.id ?? cursor
      console.info(
        `stage variants scanned=${summary.scanned} repairable=${summary.repairable} updated=${summary.updated} missingProdAsset=${summary.counts.missingProdAsset}`
      )
    }

    if (args.apply && pending.length > 0) {
      summary.updated += await applyCandidates(stage, args.host, pending)
    }
  } finally {
    stream.end()
    await prod.$disconnect()
    await stage.$disconnect()
  }

  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf-8')

  console.info('')
  console.info('=== STAGE VIDEO VARIANT R2 SYNC FROM PROD ===')
  console.info(`mode: ${summary.mode}`)
  console.info(`host: ${summary.host}`)
  console.info(`scanned: ${summary.scanned}`)
  console.info(`repairable: ${summary.repairable}`)
  console.info(`updated: ${summary.updated}`)
  console.info(`skipped: ${summary.skipped}`)
  console.info(`missingProdVariant: ${summary.counts.missingProdVariant}`)
  console.info(`missingProdAsset: ${summary.counts.missingProdAsset}`)
  console.info(`stageAlreadyHasAsset: ${summary.counts.stageAlreadyHasAsset}`)
  console.info(`unchanged: ${summary.counts.unchanged}`)
  console.info(`summary: ${summaryPath}`)
  console.info(`rows export: ${rowsPath}`)
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
