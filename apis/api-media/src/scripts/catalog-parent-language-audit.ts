import { appendFile, writeFile } from 'fs/promises'

import { prisma } from '@core/prisma/media/client'

import {
  ParentLanguageAuditEntry,
  auditAndRepairParent
} from '../lib/parentLanguageAudit/parentLanguageAudit'

export type CatalogAuditOptions = {
  apply?: boolean
  batchSize?: number
  afterId?: string
  parentId?: string
  reportPath?: string
}

export type CatalogAuditSummary = {
  parentsScanned: number
  totalFindings: number
  byAction: Record<string, number>
  byResult: Record<string, number>
  indexFailures: number
}

type Dependencies = {
  findParentIdsBatch: (args: {
    afterId?: string
    take: number
  }) => Promise<string[]>
  auditAndRepairParent: typeof auditAndRepairParent
  emit: (entry: ParentLanguageAuditEntry) => Promise<void>
}

// Discovers parents strictly by Video relationship (any Video that owns
// Children), never by container Label, so series, collections, feature-film
// containers, and future container Labels are all covered.
async function findParentIdsBatch({
  afterId,
  take
}: {
  afterId?: string
  take: number
}): Promise<string[]> {
  const parents = await prisma.video.findMany({
    where: {
      children: { some: {} },
      ...(afterId != null ? { id: { gt: afterId } } : {})
    },
    select: { id: true },
    orderBy: { id: 'asc' },
    take
  })
  return parents.map((video) => video.id)
}

// Catalog-wide, idempotent parent-language audit and repair. Dry-run by
// default; apply mode repairs only deterministic gaps (missing or
// non-normalized generated parent Variants) and indexes the result.
// Ambiguous Variants (real media indicators) are always reported, never
// mutated. Safe to interrupt and rerun: a second apply performs no further
// database writes once the catalog is consistent.
export async function runCatalogParentLanguageAudit(
  options: CatalogAuditOptions,
  overrides: Partial<Dependencies> = {}
): Promise<CatalogAuditSummary> {
  const reportPath = options.reportPath ?? 'catalog-parent-language-audit.jsonl'
  if (overrides.emit == null) await writeFile(reportPath, '')
  const dependencies: Dependencies = {
    findParentIdsBatch,
    auditAndRepairParent,
    emit: async (entry) => appendFile(reportPath, `${JSON.stringify(entry)}\n`),
    ...overrides
  }

  const summary: CatalogAuditSummary = {
    parentsScanned: 0,
    totalFindings: 0,
    byAction: {},
    byResult: {},
    indexFailures: 0
  }

  const apply = options.apply ?? false
  const singleParentId = options.parentId
  let afterId = options.afterId
  const batchSize = Math.min(Math.max(options.batchSize ?? 100, 1), 500)

  while (true) {
    const batch =
      singleParentId != null
        ? [singleParentId]
        : await dependencies.findParentIdsBatch({ afterId, take: batchSize })
    if (batch.length === 0) break

    for (const parentId of batch) {
      afterId = parentId
      summary.parentsScanned += 1
      const entries = await dependencies.auditAndRepairParent(parentId, {
        apply
      })
      for (const entry of entries) {
        summary.totalFindings += 1
        summary.byAction[entry.action] =
          (summary.byAction[entry.action] ?? 0) + 1
        summary.byResult[entry.result] =
          (summary.byResult[entry.result] ?? 0) + 1
        if (entry.indexResult === 'indexFailed') summary.indexFailures += 1
        await dependencies.emit(entry)
      }
    }

    if (singleParentId != null || batch.length < batchSize) break
  }

  return summary
}

function argument(name: string): string | undefined {
  const prefix = `--${name}=`
  return process.argv
    .find((value) => value.startsWith(prefix))
    ?.slice(prefix.length)
}

if (require.main === module) {
  const batchSizeArg = argument('batch-size')
  runCatalogParentLanguageAudit({
    apply: process.argv.includes('--apply'),
    batchSize: batchSizeArg != null ? Number(batchSizeArg) : undefined,
    afterId: argument('after-id'),
    parentId: argument('parent-id'),
    reportPath: argument('report')
  }).then(
    (summary) => {
      console.info(JSON.stringify(summary, null, 2))
      const hasFailures =
        (summary.byResult.failed ?? 0) > 0 || summary.indexFailures > 0
      if (hasFailures) process.exitCode = 1
    },
    (error) => {
      console.error(error)
      process.exitCode = 1
    }
  )
}
