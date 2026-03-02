import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

import { PrismaClient } from '.prisma/api-media-client'

import { createVideoFromUrl } from '../schema/mux/video/service'

const prisma = new PrismaClient()

// Pipeline CSV: used by process and finalize; must not be overwritten by export.
const PIPELINE_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-r2.csv'
// Export writes here so "export again to double-check" does not clobber pipeline CSV.
const EXPORT_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-export.csv'
// Audit output from audit-r2-video-metadata.ts
const AUDIT_CSV_PATH = 'apis/api-media/src/scripts/retry-mux-issues-audit.csv'
const FLUSH_EVERY = 1
const CONCURRENCY = 2

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

function csvEscape(
  value: string | number | boolean | null | undefined
): string {
  if (value === null || value === undefined) return ''
  const stringValue = String(value)
    .replace(/\r\n|\r|\n/g, ' ')
    .trim()
  const needsQuotes = /[",]/.test(stringValue)
  const escaped = stringValue.replace(/"/g, '""')
  return needsQuotes ? `"${escaped}"` : escaped
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
    if (Number.isNaN(versionValue)) {
      continue
    }

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

async function processRow(
  row: CsvRow
): Promise<{ result: string; error?: string }> {
  const now = new Date().toISOString()
  row.lastRunAt = now
  row.lastError = ''
  row.muxStatus = ''
  row.muxErrorMessage = ''

  try {
    // Look up variant only by (videoId, languageId, edition) to avoid id-format inconsistencies.
    const existingVariant = await prisma.videoVariant.findFirst({
      where: {
        videoId: row.videoId,
        languageId: row.languageId,
        edition: row.edition
      },
      select: { id: true, muxVideoId: true }
    })

    if (existingVariant?.muxVideoId) {
      const muxVideo = await prisma.muxVideo.findUnique({
        where: { id: existingVariant.muxVideoId },
        select: { id: true, assetId: true, readyToStream: true }
      })

      row.existingVariantId = existingVariant.id
      row.existingMuxVideoId = existingVariant.muxVideoId
      row.existingMuxAssetId = muxVideo?.assetId ?? ''
      row.existingMuxReadyToStream = muxVideo?.readyToStream ?? ''
      row.muxStarted = true
      row.muxProcessed = Boolean(muxVideo?.readyToStream)
      row.lastResult = 'already_started'
      return { result: row.lastResult }
    }

    const muxAsset = await createVideoFromUrl(
      row.r2PublicUrl,
      false,
      '2160p',
      true
    )

    const muxVideo = await prisma.muxVideo.create({
      data: {
        assetId: muxAsset.id,
        userId: 'system',
        downloadable: true
      }
    })

    row.existingMuxVideoId = muxVideo.id
    row.existingMuxAssetId = muxVideo.assetId ?? ''
    row.existingMuxReadyToStream = false
    row.muxStarted = true
    row.muxProcessed = false
    row.lastResult = 'mux_created'
    return { result: row.lastResult }
  } catch (error) {
    row.lastResult = 'error'
    const message = (error as Error).message
    row.lastError = message.replace(/[\r\n]+/g, ' ').trim()
    return { result: row.lastResult, error: row.lastError }
  }
}

async function main(): Promise<void> {
  const pipelinePath = resolve(PIPELINE_CSV_PATH)
  const exportPath = resolve(EXPORT_CSV_PATH)
  let contents: string
  let readPath: string
  try {
    contents = await readFile(pipelinePath, 'utf8')
    readPath = pipelinePath
  } catch {
    try {
      contents = await readFile(exportPath, 'utf8')
      readPath = exportPath
      console.log(
        `Pipeline CSV not found; using export file. Output will be written to ${pipelinePath}`
      )
    } catch {
      console.error(
        `Neither ${pipelinePath} nor ${exportPath} found. Run export-mux-retry-csv first.`
      )
      process.exitCode = 1
      return
    }
  }
  const rows = parseCsv(contents)
  let processed = 0
  let okAuditAssetIds: Set<string> | null = null
  const auditPath = resolve(AUDIT_CSV_PATH)

  try {
    const auditContents = await readFile(auditPath, 'utf8')
    okAuditAssetIds = parseAuditOkAssetIds(auditContents)
  } catch {
    console.warn(
      `Audit CSV not found at ${auditPath}. Processing without audit filtering.`
    )
  }

  console.log('=== Process Mux Retry CSV ===')
  console.log(`Input: ${readPath}`)
  console.log(`Output: ${pipelinePath}`)
  console.log(`Rows: ${rows.length}`)
  console.log(`Concurrency: ${CONCURRENCY}`)
  if (okAuditAssetIds) {
    console.log(`Audit filter: enabled (${okAuditAssetIds.size} ok assets)`)
  }

  const alreadyProcessedCount = rows.filter((row) => row.muxProcessed).length
  console.log(`Rows already muxProcessed=true: ${alreadyProcessedCount}`)

  const basePendingRows = rows.filter(
    (row) =>
      !row.muxProcessed && (row.lastResult === '' || row.lastResult === 'error')
  )
  const pendingRows =
    okAuditAssetIds == null
      ? basePendingRows
      : basePendingRows.filter((row) => okAuditAssetIds.has(row.r2AssetId))

  if (okAuditAssetIds) {
    let skippedByAudit = 0
    for (const row of basePendingRows) {
      if (!okAuditAssetIds.has(row.r2AssetId)) {
        row.lastResult = 'skipped_audit_not_ok'
        row.lastError = ''
        row.lastRunAt = new Date().toISOString()
        skippedByAudit++
      }
    }
    console.log(`Rows skipped by audit filter: ${skippedByAudit}`)
  }

  console.log(`Rows to process: ${pendingRows.length}`)
  for (let index = 0; index < pendingRows.length; index += CONCURRENCY) {
    const batch = pendingRows.slice(index, index + CONCURRENCY)
    const results = await Promise.allSettled(
      batch.map(async (row) => processRow(row))
    )
    processed += batch.length

    if (processed % FLUSH_EVERY === 0) {
      await writeFile(pipelinePath, buildCsv(rows), 'utf8')
      const lastResult = results[results.length - 1]
      const lastResultLabel =
        lastResult.status === 'fulfilled' ? lastResult.value.result : 'error'
      console.log(`Flushed ${processed} rows (last result: ${lastResultLabel})`)
    }
  }

  await writeFile(pipelinePath, buildCsv(rows), 'utf8')
  console.log(`\nProcessing complete. Updated CSV: ${pipelinePath}`)
}

if (require.main === module) {
  void main()
    .catch((error) => {
      console.error('Processing failed:', error)
      process.exitCode = 1
    })
    .finally(() => {
      void prisma.$disconnect()
    })
}
