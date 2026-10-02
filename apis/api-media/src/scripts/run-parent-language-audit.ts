import fs from 'fs'
import { mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import {
  type ParentVariantAuditResult,
  auditParentVariants
} from './audit-parent-variants'
import { hasFlag } from './cliFlags'
import {
  type ParentLanguageRepairSummary,
  type PendingIndexRetry,
  applyParentLanguageRepairs
} from './parent-language-repair'

const REPORT_DIR = path.resolve('.cache/api-media')
const REPORT_PATH = path.join(REPORT_DIR, 'parent-language-audit-report.jsonl')
const RETRY_PATH = path.join(
  REPORT_DIR,
  'parent-language-audit-index-retry.json'
)

function isPendingIndexRetryList(value: unknown): value is PendingIndexRetry[] {
  return (
    Array.isArray(value) &&
    value.every(
      (entry) =>
        typeof entry === 'object' &&
        entry != null &&
        typeof (entry as PendingIndexRetry).parentVideoId === 'string' &&
        typeof (entry as PendingIndexRetry).languageId === 'string' &&
        typeof (entry as PendingIndexRetry).variantId === 'string'
    )
  )
}

// Only a missing retry file (ENOENT) is treated as an empty queue. Any other
// read failure, or a file that exists but fails to parse as JSON, is
// propagated so the run fails loudly instead of silently discarding
// outstanding retries — savePendingIndexRetries would otherwise overwrite the
// file and lose them for good.
async function loadPendingIndexRetries(): Promise<PendingIndexRetry[]> {
  let raw: string
  try {
    raw = await readFile(RETRY_PATH, 'utf-8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return []
    }
    throw error
  }

  const parsed: unknown = JSON.parse(raw)

  if (!isPendingIndexRetryList(parsed)) {
    logger.warn(
      { retryPath: RETRY_PATH },
      'Saved index retry list has an unrecognized shape; ignoring it'
    )
    return []
  }

  return parsed
}

async function savePendingIndexRetries(
  pendingIndexRetries: PendingIndexRetry[]
): Promise<void> {
  if (!fs.existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true })
  }
  await writeFile(
    RETRY_PATH,
    JSON.stringify(pendingIndexRetries, null, 2),
    'utf-8'
  )
}

async function writeReport(
  audit: ParentVariantAuditResult,
  repair: ParentLanguageRepairSummary
): Promise<void> {
  if (!fs.existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true })
  }
  const records = [
    ...audit.deterministicGaps.map((entry) => ({ type: 'gap', ...entry })),
    ...audit.ambiguous.map((entry) => ({ type: 'ambiguous', ...entry })),
    ...repair.repaired.map((entry) => ({ type: 'repaired', ...entry })),
    ...repair.indexIncomplete.map((entry) => ({
      type: 'indexIncomplete',
      ...entry
    })),
    ...repair.failed.map((entry) => ({ type: 'failed', ...entry }))
  ]
  const lines = records.map((record) => JSON.stringify(record)).join('\n')
  await writeFile(REPORT_PATH, lines.length > 0 ? `${lines}\n` : '', 'utf-8')
}

export async function runParentLanguageAudit(apply: boolean): Promise<{
  audit: ParentVariantAuditResult
  repair: ParentLanguageRepairSummary
}> {
  const audit = await auditParentVariants()
  const pendingIndexRetries = apply ? await loadPendingIndexRetries() : []
  const repair = await applyParentLanguageRepairs(audit.deterministicGaps, {
    apply,
    pendingIndexRetries
  })

  await writeReport(audit, repair)
  if (apply) {
    await savePendingIndexRetries(repair.pendingIndexRetries)
  }

  logger.info(
    {
      apply,
      deterministicGapCount: audit.deterministicGaps.length,
      ambiguousCount: audit.ambiguous.length,
      repairedCount: repair.repaired.length,
      indexIncompleteCount: repair.indexIncomplete.length,
      failedCount: repair.failed.length,
      pendingIndexRetryCount: repair.pendingIndexRetries.length,
      reportPath: REPORT_PATH
    },
    'Catalog-wide parent-language audit completed'
  )

  return { audit, repair }
}

async function main(): Promise<void> {
  const apply = hasFlag(process.argv, 'apply')

  try {
    const { repair } = await runParentLanguageAudit(apply)
    if (
      apply &&
      (repair.indexIncomplete.length > 0 || repair.failed.length > 0)
    ) {
      process.exitCode = 1
    }
  } catch (error) {
    logger.error({ error }, 'Parent language audit failed')
    process.exitCode = 1
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  void main()
}

export { main }
