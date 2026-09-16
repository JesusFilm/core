import fs from 'fs'
import { mkdir } from 'fs/promises'
import path from 'path'

import { prisma } from '@core/prisma/media/client'

import {
  type VideoVariantStatusBackfillSummary,
  emptyBackfillSummary,
  runVideoVariantStatusBackfill
} from '../lib/videoVariantStatusBackfill'
import { logger } from '../logger'

import { hasFlag } from './cliFlags'

const REPORT_DIR = path.resolve('.cache/api-media')
const REPORT_PATH = path.join(
  REPORT_DIR,
  'video-variant-status-backfill-report.jsonl'
)

function mergeSummary(
  target: VideoVariantStatusBackfillSummary,
  batch: VideoVariantStatusBackfillSummary
): void {
  target.totalCandidates += batch.totalCandidates
  target.applied += batch.applied
  target.skipAlreadyCanonical += batch.skipAlreadyCanonical
  target.promoteExistingUpload += batch.promoteExistingUpload
  target.createSyntheticCanonical += batch.createSyntheticCanonical
  target.failed += batch.failed
}

/**
 * Gives every existing VideoVariant, including generated parent Variants,
 * exactly one canonical VideoVariantUpload status record. Defaults to
 * dry-run; pass --apply to write. Idempotent -- rerunning after a full apply
 * performs no further writes, since every Variant already has a canonical
 * row to skip.
 */
async function main(): Promise<void> {
  const apply = hasFlag(process.argv, 'apply')

  logger.info(
    { apply },
    `Video variant status backfill starting (${apply ? 'apply' : 'dry-run'} mode)`
  )

  await mkdir(REPORT_DIR, { recursive: true })
  const reportStream = fs.createWriteStream(REPORT_PATH, { flags: 'w' })

  const totalSummary = emptyBackfillSummary()
  let startAfterId: string | null = null
  let hasMore = true
  let batchNumber = 0

  try {
    while (hasMore) {
      batchNumber++
      const result = await runVideoVariantStatusBackfill({
        apply,
        startAfterId
      })

      for (const record of result.records) {
        reportStream.write(`${JSON.stringify(record)}\n`)
      }

      mergeSummary(totalSummary, result.summary)
      startAfterId = result.lastProcessedId
      hasMore = result.hasMore

      logger.info(
        { batchNumber, ...result.summary },
        `Batch ${batchNumber} processed`
      )
    }
  } finally {
    await new Promise<void>((resolve) => reportStream.end(resolve))
  }

  logger.info(
    { summary: totalSummary },
    'Video variant status backfill summary'
  )
  logger.info({ reportPath: REPORT_PATH }, 'Audit report written')

  if (totalSummary.failed > 0) {
    logger.error(
      { failed: totalSummary.failed },
      'Video variant status backfill completed with failures'
    )
    process.exitCode = 1
  }
}

if (require.main === module) {
  main()
    .then(() => prisma.$disconnect())
    .catch((error) => {
      logger.error({ error }, 'Video variant status backfill failed')
      return prisma.$disconnect().finally(() => process.exit(1))
    })
}

export { main }
