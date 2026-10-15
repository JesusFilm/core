import fs from 'fs'
import { appendFile, mkdir, readFile, writeFile } from 'fs/promises'
import path from 'path'

import { prisma } from '@core/prisma/media/client'

import { logger } from '../logger'

import {
  type ParentVariantAuditResult,
  auditParentVariants
} from './audit-parent-variants'
import { hasFlag } from './cliFlags'
import {
  type ParentLanguageRepairOutcome,
  type ParentLanguageRepairSummary,
  type PendingIndexRetry,
  applyParentLanguageRepairs,
  toPendingRetry
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

async function ensureReportDir(): Promise<void> {
  if (!fs.existsSync(REPORT_DIR)) {
    await mkdir(REPORT_DIR, { recursive: true })
  }
}

async function savePendingIndexRetries(
  pendingIndexRetries: PendingIndexRetry[]
): Promise<void> {
  await ensureReportDir()
  await writeFile(
    RETRY_PATH,
    JSON.stringify(pendingIndexRetries, null, 2),
    'utf-8'
  )
}

function retryKey(
  entry: Pick<
    PendingIndexRetry,
    'parentVideoId' | 'childVideoId' | 'languageId' | 'variantId'
  >
): string {
  return [
    entry.parentVideoId,
    entry.childVideoId,
    entry.languageId,
    entry.variantId
  ].join(':')
}

async function initReport(
  records: Array<Record<string, unknown>>
): Promise<void> {
  await ensureReportDir()
  const lines = records.map((record) => JSON.stringify(record)).join('\n')
  await writeFile(REPORT_PATH, lines.length > 0 ? `${lines}\n` : '', 'utf-8')
}

async function appendReportRecord(
  record: Record<string, unknown>
): Promise<void> {
  await ensureReportDir()
  await appendFile(REPORT_PATH, `${JSON.stringify(record)}\n`, 'utf-8')
}

async function writeReport(
  audit: ParentVariantAuditResult,
  repair: ParentLanguageRepairSummary
): Promise<void> {
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
  await initReport(records)
}

export async function runParentLanguageAudit(apply: boolean): Promise<{
  audit: ParentVariantAuditResult
  repair: ParentLanguageRepairSummary
}> {
  const audit = await auditParentVariants()
  const pendingIndexRetries = apply ? await loadPendingIndexRetries() : []

  // Persisted once up front so an apply run that gets interrupted during the
  // (potentially long) repair loop below still leaves the detected gaps on
  // disk, then kept current after every single outcome via onOutcome —
  // rather than only writing the report and retry file once the whole batch
  // finishes, which would lose every completed outcome on an interruption
  // even though the underlying database writes already happened.
  await initReport([
    ...audit.deterministicGaps.map((entry) => ({ type: 'gap', ...entry })),
    ...audit.ambiguous.map((entry) => ({ type: 'ambiguous', ...entry }))
  ])

  const repairOptions: {
    apply: boolean
    pendingIndexRetries: PendingIndexRetry[]
    onOutcome?: (outcome: ParentLanguageRepairOutcome) => Promise<void>
  } = { apply, pendingIndexRetries }

  if (apply) {
    const retries = new Map(
      pendingIndexRetries.map((retry) => [retryKey(retry), retry])
    )
    repairOptions.onOutcome = async (outcome) => {
      await appendReportRecord({ type: outcome.result, ...outcome })
      if (outcome.result === 'indexIncomplete') {
        retries.set(retryKey(outcome), toPendingRetry(outcome))
      } else if (outcome.result === 'repaired') {
        retries.delete(retryKey(outcome))
      }
      await savePendingIndexRetries([...retries.values()])
    }
  }

  const repair = await applyParentLanguageRepairs(
    audit.deterministicGaps,
    repairOptions
  )

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
