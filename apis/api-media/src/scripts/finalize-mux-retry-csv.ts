import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

import { logger } from '../logger'
import { getVideo } from '../schema/mux/video/service'

const prisma = new PrismaClient()

const CSV_PATH = 'apis/api-media/src/scripts/retry-mux-r2.csv'
const AUDIT_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-issues-audit.csv'
const FLUSH_EVERY = 10

interface CsvRow {
  r2AssetId: string
  r2PublicUrl: string
  originalFilename: string
  videoId: string
  languageId: string
  edition: string
  version: number
  existingVariantId: string
  existingMuxVideoId: string
  existingMuxAssetId: string
  existingMuxReadyToStream: boolean | ''
  muxStarted: boolean
  muxProcessed: boolean
  muxStatus: string
  muxErrorMessage: string
  lastRunAt: string
  lastResult: string
  lastError: string
}

function sanitizeForCsv(s: string, maxLength = 500): string {
  return s
    .replace(/\r\n|\r|\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
}

function csvEscape(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value).replace(/\r\n|\r|\n/g, ' ').trim()
  const escaped = stringValue.replace(/"/g, '""')
  return /[",]/.test(stringValue) ? `"${escaped}"` : escaped
}

function parseCsvLine(line: string): string[] {
  const values: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      const nextChar = line[i + 1]
      if (inQuotes && nextChar === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (char === ',' && !inQuotes) {
      values.push(current)
      current = ''
      continue
    }

    current += char
  }

  values.push(current)
  return values
}

function parseCsv(contents: string): CsvRow[] {
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length === 0) return []

  const header = parseCsvLine(lines[0])
  const columnIndex = new Map<string, number>()
  for (let i = 0; i < header.length; i++) {
    columnIndex.set(header[i], i)
  }

  const getValue = (row: string[], key: string): string =>
    row[columnIndex.get(key) ?? -1] ?? ''

  const rows: CsvRow[] = []
  for (const line of lines.slice(1)) {
    const columns = parseCsvLine(line)
    const versionValue = Number.parseInt(getValue(columns, 'version'), 10)
    if (Number.isNaN(versionValue)) continue

    rows.push({
      r2AssetId: getValue(columns, 'r2AssetId'),
      r2PublicUrl: getValue(columns, 'r2PublicUrl'),
      originalFilename: getValue(columns, 'originalFilename'),
      videoId: getValue(columns, 'videoId'),
      languageId: getValue(columns, 'languageId'),
      edition: getValue(columns, 'edition'),
      version: versionValue,
      existingVariantId: getValue(columns, 'existingVariantId'),
      existingMuxVideoId: getValue(columns, 'existingMuxVideoId'),
      existingMuxAssetId: getValue(columns, 'existingMuxAssetId'),
      existingMuxReadyToStream:
        getValue(columns, 'existingMuxReadyToStream') === ''
          ? ''
          : getValue(columns, 'existingMuxReadyToStream') === 'true',
      muxStarted: getValue(columns, 'muxStarted') === 'true',
      muxProcessed: getValue(columns, 'muxProcessed') === 'true',
      muxStatus: getValue(columns, 'muxStatus'),
      muxErrorMessage: getValue(columns, 'muxErrorMessage'),
      lastRunAt: getValue(columns, 'lastRunAt'),
      lastResult: getValue(columns, 'lastResult'),
      lastError: getValue(columns, 'lastError')
    })
  }

  return rows
}

function buildCsv(rows: CsvRow[]): string {
  const header = [
    'r2AssetId',
    'r2PublicUrl',
    'originalFilename',
    'videoId',
    'languageId',
    'edition',
    'version',
    'existingVariantId',
    'existingMuxVideoId',
    'existingMuxAssetId',
    'existingMuxReadyToStream',
    'muxStarted',
    'muxProcessed',
    'muxStatus',
    'muxErrorMessage',
    'lastRunAt',
    'lastResult',
    'lastError'
  ]

  const body = rows.map((row) =>
    [
      row.r2AssetId,
      row.r2PublicUrl,
      row.originalFilename,
      row.videoId,
      row.languageId,
      row.edition,
      row.version,
      row.existingVariantId,
      row.existingMuxVideoId,
      row.existingMuxAssetId,
      row.existingMuxReadyToStream,
      row.muxStarted,
      row.muxProcessed,
      row.muxStatus,
      row.muxErrorMessage,
      row.lastRunAt,
      row.lastResult,
      row.lastError
    ]
      .map(csvEscape)
      .join(',')
  )

  return [header.join(','), ...body].join('\n')
}

function parseAuditOkAssetIds(contents: string): Set<string> {
  const lines = contents.split(/\r?\n/).filter((line) => line.length > 0)
  if (lines.length <= 1) return new Set<string>()

  const header = parseCsvLine(lines[0])
  const columnIndex = new Map<string, number>()
  for (let i = 0; i < header.length; i++) {
    columnIndex.set(header[i], i)
  }

  const getValue = (row: string[], key: string): string =>
    row[columnIndex.get(key) ?? -1] ?? ''

  const okAssetIds = new Set<string>()
  for (const line of lines.slice(1)) {
    const row = parseCsvLine(line)
    const status = getValue(row, 'status')
    const r2AssetId = getValue(row, 'r2AssetId')
    if (status === 'ok' && r2AssetId) {
      okAssetIds.add(r2AssetId)
    }
  }

  return okAssetIds
}

function getMuxErrorMessage(asset: { errors?: unknown; error?: { message?: string } }): string {
  const readMessage = (value: unknown): string =>
    typeof value === 'string' ? value : ''

  const { errors } = asset
  if (Array.isArray(errors)) {
    return errors
      .map((item) =>
        typeof item === 'object' && item !== null && 'message' in item
          ? readMessage((item as { message?: unknown }).message)
          : ''
      )
      .filter(Boolean)
      .join('; ')
  }

  if (typeof errors === 'object' && errors !== null && 'message' in errors) {
    return readMessage((errors as { message?: unknown }).message)
  }

  return asset.error?.message ?? ''
}

async function chooseVariantSlug(
  videoSlug: string,
  row: Pick<CsvRow, 'videoId' | 'languageId'>
): Promise<string> {
  const candidates = [
    videoSlug,
    `${videoSlug}/${row.languageId}`,
    `${videoSlug}/${row.languageId}-${row.videoId}`
  ]

  for (const candidate of candidates) {
    const existingBySlug = await prisma.videoVariant.findUnique({
      where: { slug: candidate },
      select: { id: true }
    })
    if (!existingBySlug) return candidate
  }

  return `${videoSlug}/${row.languageId}-${row.videoId}-${Date.now()}`
}

async function upsertVideoVariant(row: CsvRow, playbackId: string): Promise<string> {
  const [videoInfo, existingVariant] = await Promise.all([
    prisma.video.findUnique({
      where: { id: row.videoId },
      select: { slug: true }
    }),
    prisma.videoVariant.findFirst({
      where: {
        videoId: row.videoId,
        languageId: row.languageId
      },
      select: { id: true, slug: true }
    })
  ])

  if (!videoInfo?.slug) {
    throw new Error(`Video slug not found: ${row.videoId}`)
  }

  const muxStreamBaseUrl =
    process.env.MUX_STREAM_BASE_URL || 'https://stream.mux.com/'
  const watchPageBaseUrl =
    process.env.WATCH_PAGE_BASE_URL || 'http://jesusfilm.org/watch/'

  const slug = existingVariant?.slug ?? (await chooseVariantSlug(videoInfo.slug, row))
  const data = {
    hls: `${muxStreamBaseUrl}${playbackId}.m3u8`,
    share: `${watchPageBaseUrl}${slug}`,
    muxVideoId: row.existingMuxVideoId,
    edition: row.edition,
    version: row.version,
    published: true,
    downloadable: true
  }

  if (existingVariant) {
    await prisma.videoVariant.update({
      where: { id: existingVariant.id },
      data
    })
    return existingVariant.id
  }

  const newVariantId = `${row.languageId}_${row.videoId}`
  try {
    await prisma.videoVariant.create({
      data: {
        id: newVariantId,
        videoId: row.videoId,
        languageId: row.languageId,
        slug,
        ...data
      }
    })
    return newVariantId
  } catch (createError) {
    // If another process created it between read and create, update instead.
    const variantsForPair = await prisma.videoVariant.findMany({
      where: { videoId: row.videoId, languageId: row.languageId },
      select: { id: true, edition: true }
    })

    const variantToUpdate =
      variantsForPair.find((variant) => variant.edition === row.edition) ??
      variantsForPair[0]

    if (!variantToUpdate) {
      throw new Error(
        `Failed to upsert videoVariant for ${row.videoId}/${row.languageId}/${row.edition}; createError=${(createError as Error).message}`
      )
    }

    await prisma.videoVariant.update({
      where: { id: variantToUpdate.id },
      data
    })
    return variantToUpdate.id
  }
}

async function processRow(row: CsvRow): Promise<string> {
  row.lastRunAt = new Date().toISOString()
  row.lastError = ''
  row.muxErrorMessage = ''
  row.muxStatus = ''
  row.muxStarted = true

  if (!row.existingMuxVideoId) {
    row.lastResult = 'missing_mux_video'
    return row.lastResult
  }

  const muxVideo = await prisma.muxVideo.findUnique({
    where: { id: row.existingMuxVideoId },
    select: { id: true, assetId: true, readyToStream: true, playbackId: true }
  })

  if (!muxVideo?.assetId) {
    row.lastResult = 'missing_mux_asset'
    return row.lastResult
  }

  row.existingMuxAssetId = muxVideo.assetId
  row.existingMuxReadyToStream = muxVideo.readyToStream ?? ''

  let playbackId = muxVideo.playbackId ?? ''
  let isReady = Boolean(muxVideo.readyToStream && playbackId)

  if (!isReady) {
    const asset = await getVideo(muxVideo.assetId, false)
    row.muxStatus = asset?.status ?? ''
    row.muxErrorMessage = sanitizeForCsv(getMuxErrorMessage(asset), 500)

    if (asset.status !== 'ready') {
      row.lastResult = asset.status ?? 'pending'
      return row.lastResult
    }

    playbackId = asset.playback_ids?.[0]?.id ?? ''
    if (!playbackId) {
      row.lastResult = 'ready_missing_playback_id'
      return row.lastResult
    }

    await prisma.muxVideo.update({
      where: { id: muxVideo.id },
      data: {
        playbackId,
        readyToStream: true,
        duration: Math.ceil(asset.duration ?? 0),
        downloadable: true
      }
    })

    row.existingMuxReadyToStream = true
    isReady = true
  }

  if (!isReady || !playbackId) {
    row.lastResult = 'not_ready'
    return row.lastResult
  }

  const variantId = await upsertVideoVariant(row, playbackId)
  row.existingVariantId = variantId
  row.muxProcessed = true
  row.lastResult = 'processed_ready'
  return row.lastResult
}

async function main(): Promise<void> {
  const csvPath = resolve(CSV_PATH)
  const rows = parseCsv(await readFile(csvPath, 'utf8'))
  const auditPath = resolve(AUDIT_CSV_PATH)
  let okAuditAssetIds: Set<string> | null = null

  try {
    const auditContents = await readFile(auditPath, 'utf8')
    okAuditAssetIds = parseAuditOkAssetIds(auditContents)
  } catch {
    console.warn(
      `Audit CSV not found at ${auditPath}. Finalizing without audit filtering.`
    )
  }

  console.log('=== Finalize Mux Retry CSV (simple) ===')
  console.log(`Input: ${csvPath}`)
  console.log(`Rows: ${rows.length}`)
  if (okAuditAssetIds) {
    console.log(`Audit filter: enabled (${okAuditAssetIds.size} ok assets)`)
  }

  const rowsToProcess =
    okAuditAssetIds == null
      ? rows.filter((row) => !row.muxProcessed)
      : rows.filter((row) => !row.muxProcessed && okAuditAssetIds.has(row.r2AssetId))

  const alreadyProcessedCount = rows.filter((row) => row.muxProcessed).length
  console.log(`Rows already muxProcessed=true: ${alreadyProcessedCount}`)

  if (okAuditAssetIds) {
    let skippedByAudit = 0
    const now = new Date().toISOString()
    for (const row of rows) {
      if (!okAuditAssetIds.has(row.r2AssetId)) {
        row.lastResult = 'skipped_audit_not_ok'
        row.lastError = ''
        row.lastRunAt = now
        skippedByAudit++
      }
    }
    console.log(`Rows skipped by audit filter: ${skippedByAudit}`)
  }
  console.log(`Rows to process: ${rowsToProcess.length}`)

  let processed = 0
  for (const row of rowsToProcess) {
    try {
      const result = await processRow(row)
      processed++

      if (processed % FLUSH_EVERY === 0) {
        await writeFile(csvPath, buildCsv(rows), 'utf8')
        console.log(
          `Processed ${processed}/${rowsToProcess.length} (last result: ${result})`
        )
      }
    } catch (error) {
      row.lastResult = 'error'
      row.lastError = sanitizeForCsv((error as Error).message)
      processed++

      if (processed % FLUSH_EVERY === 0) {
        await writeFile(csvPath, buildCsv(rows), 'utf8')
        console.log(
          `Processed ${processed}/${rowsToProcess.length} (last result: error)`
        )
      }
    }
  }

  await writeFile(csvPath, buildCsv(rows), 'utf8')
  console.log(`Finalize complete. Updated CSV: ${csvPath}`)
}

if (require.main === module) {
  void main()
    .catch((error) => {
      logger.error({ error }, 'Finalize failed')
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
