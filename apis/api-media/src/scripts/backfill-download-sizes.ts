import fs from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { prisma } from '@core/prisma/media/client'

import type { BackfillProvider, BackfillSummary } from '../lib/downloadSizeBackfill'
import { runDownloadSizeBackfill } from '../lib/downloadSizeBackfill'

const REPORT_DIR = path.resolve('.cache/api-media')
const REPORT_PATH = path.join(REPORT_DIR, 'download-size-backfill-report.jsonl')
const CURSOR_PATH = path.join(REPORT_DIR, 'download-size-backfill-cursor.json')

function parseProviderFilter(value: string | undefined): BackfillProvider | undefined {
  if (value == null || value === '') return undefined
  if (value === 'mux' || value === 'r2' || value === 'legacy') return value
  throw new Error(`Invalid provider filter: ${value}. Expected mux, r2, or legacy`)
}

async function loadCursor(): Promise<string | null> {
  try {
    const raw = await readFile(CURSOR_PATH, 'utf-8')
    const parsed: unknown = JSON.parse(raw)
    return typeof parsed === 'object' && parsed != null && 'lastProcessedId' in parsed
      ? ((parsed as { lastProcessedId: string | null }).lastProcessedId ?? null)
      : null
  } catch {
    return null
  }
}

async function saveCursor(lastProcessedId: string | null): Promise<void> {
  if (!fs.existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true })
  }
  await writeFile(
    CURSOR_PATH,
    JSON.stringify({ lastProcessedId }, null, 2),
    'utf-8'
  )
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
    targetProvider.repairable += batchProvider.repairable
    targetProvider.applied += batchProvider.applied
    targetProvider.alreadyCorrected += batchProvider.alreadyCorrected
    targetProvider.skipped += batchProvider.skipped
    targetProvider.failed += batchProvider.failed
  }
}

function emptySummary(): BackfillSummary {
  return {
    totalCandidates: 0,
    repairable: 0,
    applied: 0,
    alreadyCorrected: 0,
    skipped: 0,
    failed: 0,
    byProvider: {
      mux: {
        totalCandidates: 0,
        repairable: 0,
        applied: 0,
        alreadyCorrected: 0,
        skipped: 0,
        failed: 0
      },
      r2: {
        totalCandidates: 0,
        repairable: 0,
        applied: 0,
        alreadyCorrected: 0,
        skipped: 0,
        failed: 0
      },
      legacy: {
        totalCandidates: 0,
        repairable: 0,
        applied: 0,
        alreadyCorrected: 0,
        skipped: 0,
        failed: 0
      }
    }
  }
}

/**
 * Standalone Download-size backfill command. Repairs null/nonpositive
 * `size` values on existing Downloads from authoritative Mux, R2, and
 * legacy-URL provider data.
 *
 * Defaults to dry-run and processes all eligible rows globally in
 * resumable batches. Set DOWNLOAD_SIZE_BACKFILL_APPLY=true to write.
 * Optional filters (DOWNLOAD_SIZE_BACKFILL_DOWNLOAD_ID,
 * DOWNLOAD_SIZE_BACKFILL_VARIANT_ID, DOWNLOAD_SIZE_BACKFILL_PROVIDER)
 * scope a run for focused validation.
 */
async function main(): Promise<void> {
  const apply = process.env.DOWNLOAD_SIZE_BACKFILL_APPLY === 'true'
  const resume = process.env.DOWNLOAD_SIZE_BACKFILL_RESUME === 'true'
  const batchSizeValue = process.env.DOWNLOAD_SIZE_BACKFILL_BATCH_SIZE?.trim()
  const batchSize =
    batchSizeValue != null && batchSizeValue !== ''
      ? Number.parseInt(batchSizeValue, 10)
      : undefined

  const filters = {
    downloadId: process.env.DOWNLOAD_SIZE_BACKFILL_DOWNLOAD_ID?.trim() || undefined,
    videoVariantId:
      process.env.DOWNLOAD_SIZE_BACKFILL_VARIANT_ID?.trim() || undefined,
    provider: parseProviderFilter(process.env.DOWNLOAD_SIZE_BACKFILL_PROVIDER)
  }

  console.log(
    `Download size backfill starting (${apply ? 'apply' : 'dry-run'} mode)${
      resume ? ', resuming from saved cursor' : ''
    }`
  )

  await mkdir(REPORT_DIR, { recursive: true })
  const reportStream = fs.createWriteStream(REPORT_PATH, {
    flags: resume ? 'a' : 'w'
  })

  const totalSummary = emptySummary()
  let startAfterId = resume ? await loadCursor() : null
  let hasMore = true
  let batchNumber = 0

  try {
    while (hasMore) {
      batchNumber++
      const result = await runDownloadSizeBackfill({
        apply,
        batchSize,
        startAfterId,
        filters,
        onRecord: (record) => {
          reportStream.write(`${JSON.stringify(record)}\n`)
        }
      })

      mergeSummary(totalSummary, result.summary)
      startAfterId = result.lastProcessedId
      hasMore = result.hasMore

      console.log(
        `Batch ${batchNumber}: processed ${result.summary.totalCandidates} candidates (repairable=${result.summary.repairable}, applied=${result.summary.applied}, alreadyCorrected=${result.summary.alreadyCorrected}, skipped=${result.summary.skipped}, failed=${result.summary.failed})`
      )

      await saveCursor(startAfterId)
    }
  } finally {
    reportStream.end()
  }

  console.log('\n=== Download size backfill summary ===')
  console.log(JSON.stringify(totalSummary, null, 2))
  console.log(`Audit report written to ${REPORT_PATH}`)
}

if (require.main === module) {
  main()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      console.error('Download size backfill failed:', error)
      return prisma.$disconnect().finally(() => process.exit(1))
    })
}

export { main }
