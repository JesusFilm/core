import { once } from 'events'
import fs from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { prisma } from '@core/prisma/media/client'

import {
  type BackfillAuditRecord,
  type BackfillProvider,
  type BackfillSummary,
  type DownloadSizeBackfillFilters,
  assertValidBatchSize,
  emptyBackfillSummary,
  runDownloadSizeBackfill
} from '../lib/downloadSizeBackfill'
import { logger } from '../logger'

import { hasFlag } from './cliFlags'

const REPORT_DIR = path.resolve('.cache/api-media')
const REPORT_PATH = path.join(REPORT_DIR, 'download-size-backfill-report.jsonl')
const CURSOR_PATH = path.join(REPORT_DIR, 'download-size-backfill-cursor.json')

type SavedCursor = {
  lastProcessedId: string | null
  apply: boolean
  filters: DownloadSizeBackfillFilters
}

function parseProviderFilter(
  value: string | undefined
): BackfillProvider | undefined {
  if (value == null || value === '') return undefined
  if (value === 'mux' || value === 'r2' || value === 'legacy') return value
  throw new Error(
    `Invalid provider filter: ${value}. Expected mux, r2, or legacy`
  )
}

function parseBatchSizeEnv(value: string | undefined): number | undefined {
  if (value == null || value === '') return undefined
  if (!/^-?\d+$/.test(value)) {
    throw new Error(
      `Invalid DOWNLOAD_SIZE_BACKFILL_BATCH_SIZE: ${value}. Expected an integer.`
    )
  }
  return assertValidBatchSize(Number(value))
}

function filtersEqual(
  a: DownloadSizeBackfillFilters,
  b: DownloadSizeBackfillFilters
): boolean {
  return (
    (a.downloadId ?? null) === (b.downloadId ?? null) &&
    (a.videoVariantId ?? null) === (b.videoVariantId ?? null) &&
    (a.provider ?? null) === (b.provider ?? null)
  )
}

function isSavedCursor(value: unknown): value is SavedCursor {
  if (typeof value !== 'object' || value == null) return false
  const candidate = value as Partial<SavedCursor>
  return (
    ('lastProcessedId' in candidate
      ? typeof candidate.lastProcessedId === 'string' ||
        candidate.lastProcessedId === null
      : false) &&
    typeof candidate.apply === 'boolean' &&
    typeof candidate.filters === 'object' &&
    candidate.filters != null
  )
}

/**
 * Loads a saved cursor only when it was produced by a run with the same
 * apply mode and filters. A cursor bound to a different configuration is
 * discarded (resume starts from the beginning) instead of silently
 * skipping every row at or before it — e.g. a dry-run cursor accepted by
 * an apply run would leave everything up to that point unrepaired.
 */
async function loadCursor(
  apply: boolean,
  filters: DownloadSizeBackfillFilters
): Promise<string | null> {
  let raw: string
  try {
    raw = await readFile(CURSOR_PATH, 'utf-8')
  } catch {
    return null
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return null
  }

  if (!isSavedCursor(parsed)) {
    logger.warn(
      { cursorPath: CURSOR_PATH },
      'Saved cursor has an unrecognized shape; starting from the beginning'
    )
    return null
  }

  if (parsed.apply !== apply || !filtersEqual(parsed.filters, filters)) {
    logger.warn(
      {
        cursorPath: CURSOR_PATH,
        savedApply: parsed.apply,
        savedFilters: parsed.filters,
        requestedApply: apply,
        requestedFilters: filters
      },
      'Saved cursor was produced by a run with a different apply mode or filters; starting from the beginning'
    )
    return null
  }

  return parsed.lastProcessedId
}

async function saveCursor(
  lastProcessedId: string | null,
  apply: boolean,
  filters: DownloadSizeBackfillFilters
): Promise<void> {
  if (!fs.existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true })
  }
  const cursor: SavedCursor = { lastProcessedId, apply, filters }
  await writeFile(CURSOR_PATH, JSON.stringify(cursor, null, 2), 'utf-8')
}

/**
 * Writes each record and respects stream backpressure — a global backfill
 * can produce far more audit lines than fit in the stream's internal
 * buffer, so a write that returns false is followed by an awaited drain
 * before continuing. Records are written synchronously with the batch that
 * produced them, so the cursor (saved after this resolves) never advances
 * past an audit line that has not yet been queued to the stream.
 */
async function writeRecords(
  stream: fs.WriteStream,
  records: BackfillAuditRecord[]
): Promise<void> {
  for (const record of records) {
    const canContinue = stream.write(`${JSON.stringify(record)}\n`)
    if (!canContinue) {
      await once(stream, 'drain')
    }
  }
}

async function closeReportStream(stream: fs.WriteStream): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    stream.end((error?: NodeJS.ErrnoException | null) => {
      if (error != null) reject(error)
      else resolve()
    })
  })
}

function mergeSummary(target: BackfillSummary, batch: BackfillSummary): void {
  target.totalCandidates += batch.totalCandidates
  target.repairable += batch.repairable
  target.applied += batch.applied
  target.alreadyCorrected += batch.alreadyCorrected
  target.skipped += batch.skipped
  target.failed += batch.failed

  for (const provider of ['mux', 'r2', 'legacy'] as const) {
    const targetProvider = target.byProvider[provider]
    const batchProvider = batch.byProvider[provider]
    targetProvider.totalCandidates += batchProvider.totalCandidates
    targetProvider.applied += batchProvider.applied
    targetProvider.repairable += batchProvider.repairable
    targetProvider.alreadyCorrected += batchProvider.alreadyCorrected
    targetProvider.skipped += batchProvider.skipped
    targetProvider.failed += batchProvider.failed
  }
}

/**
 * Standalone Download-size backfill command. Repairs null/nonpositive
 * `size` values on existing Downloads from authoritative Mux, R2, and
 * legacy-URL provider data.
 *
 * Defaults to dry-run and processes all eligible rows globally in
 * resumable batches. Pass --apply to write. Optional filters
 * (DOWNLOAD_SIZE_BACKFILL_DOWNLOAD_ID, DOWNLOAD_SIZE_BACKFILL_VARIANT_ID,
 * DOWNLOAD_SIZE_BACKFILL_PROVIDER) scope a run for focused validation.
 */
async function main(): Promise<void> {
  const apply = hasFlag(process.argv, 'apply')
  const resume = process.env.DOWNLOAD_SIZE_BACKFILL_RESUME === 'true'
  // Validate at the command boundary, before any I/O — an invalid batch
  // size must never reach the query loop, where it can return zero rows
  // while hasMore stays true and the cursor never advances.
  const batchSize = parseBatchSizeEnv(
    process.env.DOWNLOAD_SIZE_BACKFILL_BATCH_SIZE?.trim()
  )

  const filters: DownloadSizeBackfillFilters = {
    downloadId:
      process.env.DOWNLOAD_SIZE_BACKFILL_DOWNLOAD_ID?.trim() || undefined,
    videoVariantId:
      process.env.DOWNLOAD_SIZE_BACKFILL_VARIANT_ID?.trim() || undefined,
    provider: parseProviderFilter(process.env.DOWNLOAD_SIZE_BACKFILL_PROVIDER)
  }

  logger.info(
    { apply, resume, filters },
    `Download size backfill starting (${apply ? 'apply' : 'dry-run'} mode)`
  )

  await mkdir(REPORT_DIR, { recursive: true })
  const reportStream = fs.createWriteStream(REPORT_PATH, {
    flags: resume ? 'a' : 'w'
  })

  const totalSummary = emptyBackfillSummary()
  let startAfterId = resume ? await loadCursor(apply, filters) : null
  let hasMore = true
  let batchNumber = 0

  try {
    while (hasMore) {
      batchNumber++
      const result = await runDownloadSizeBackfill({
        apply,
        batchSize,
        startAfterId,
        filters
      })

      // Write this batch's records — and let the cursor move past them —
      // before starting the next batch, so a crash never leaves the cursor
      // ahead of unflushed audit lines.
      await writeRecords(reportStream, result.records)

      mergeSummary(totalSummary, result.summary)
      startAfterId = result.lastProcessedId
      hasMore = result.hasMore

      logger.info(
        {
          batchNumber,
          totalCandidates: result.summary.totalCandidates,
          repairable: result.summary.repairable,
          applied: result.summary.applied,
          alreadyCorrected: result.summary.alreadyCorrected,
          skipped: result.summary.skipped,
          failed: result.summary.failed
        },
        `Batch ${batchNumber} processed`
      )

      await saveCursor(startAfterId, apply, filters)
    }
  } finally {
    await closeReportStream(reportStream)
  }

  logger.info({ summary: totalSummary }, 'Download size backfill summary')
  logger.info({ reportPath: REPORT_PATH }, 'Audit report written')
}

if (require.main === module) {
  main()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      logger.error({ error }, 'Download size backfill failed')
      return prisma.$disconnect().finally(() => process.exit(1))
    })
}

export { main }
