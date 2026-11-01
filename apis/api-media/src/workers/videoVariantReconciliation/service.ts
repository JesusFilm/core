import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import {
  getMediaDataLangSlackConfig,
  slackChatPostMessage
} from '../../lib/slack'
import { reconcileVideoVariantReconciliation } from '../../schema/videoVariantReconciliation/reconcileVideoVariantReconciliation'
import type { ProcessingStages } from '../../schema/videoVariantReconciliation/reconciliationStages'
import { logger as defaultLogger } from '../lib/logger'

import { findDueReconciliations } from './dueRecords'

// Cap per-sweep work so a growing table can't push a single sweep past the
// worker's repeat interval (config.ts `repeat`).
const SWEEP_BATCH_SIZE = 200

// Claim window: how far forward we push retryAt before processing a record,
// so a concurrent sweep (overrun schedule, or a second replica) sees it as
// not-yet-due and skips it rather than double-processing it. Must comfortably
// exceed one record's expected processing time (Prisma + Algolia calls).
const CLAIM_DURATION_MS = 5 * 60 * 1000

// Algolia is a backup search for Watch, so a Variant blocked only on its
// index writes is left `degraded` for the Algolia troubleshooter in
// videos-admin rather than paged to Slack. Mux, parent-sync and Downloads
// failures still alert: those mean the Variant itself isn't right.
const ALGOLIA_STAGES: ReadonlySet<keyof ProcessingStages> = new Set([
  'algoliaVideo',
  'algoliaVariant'
])

export function failedStageNames(processingStages: unknown): string[] {
  if (processingStages == null || typeof processingStages !== 'object') {
    return []
  }
  return Object.entries(processingStages as Record<string, unknown>)
    .filter(
      ([, stage]) =>
        stage != null &&
        typeof stage === 'object' &&
        (stage as { state?: unknown }).state === 'failed'
    )
    .map(([name]) => name)
}

export function shouldAlertOnBlockedStages(failedStages: string[]): boolean {
  if (failedStages.length === 0) return true
  return failedStages.some(
    (stage) => !ALGOLIA_STAGES.has(stage as keyof ProcessingStages)
  )
}

function dueRecordWhere() {
  return {
    status: { in: ['processing' as const, 'degraded' as const] },
    OR: [
      { status: 'processing' as const, retryAt: null },
      { retryAt: { lte: new Date() } }
    ]
  }
}

export async function service(logger: Logger = defaultLogger): Promise<void> {
  const dueStatuses = await findDueReconciliations({
    where: dueRecordWhere(),
    take: SWEEP_BATCH_SIZE
  })

  for (const status of dueStatuses) {
    try {
      // Claim the record by advancing retryAt before processing it. The
      // where-clause repeats the due-record condition so the update only
      // succeeds if the record is still due at claim time -- if another
      // sweep or replica already claimed it (or completed it), count is 0
      // and we skip it here instead of duplicating the Algolia writes and
      // hitting the duplicate-key race in reconcileParentVariants.ts.
      const claim = await prisma.videoVariantReconciliation.updateMany({
        where: { id: status.id, ...dueRecordWhere() },
        data: { retryAt: new Date(Date.now() + CLAIM_DURATION_MS) }
      })
      if (claim.count === 0) continue

      const result = await reconcileVideoVariantReconciliation(status.id)
      if (result.publicationReady) continue

      const currentStatus =
        await prisma.videoVariantReconciliation.findUniqueOrThrow({
          where: { id: status.id },
          select: {
            id: true,
            videoVariantId: true,
            status: true,
            retryAt: true,
            errorMessage: true,
            processingStages: true
          }
        })
      if (
        currentStatus.retryAt != null ||
        currentStatus.status === 'processing'
      ) {
        continue
      }

      const failedStages = failedStageNames(currentStatus.processingStages)
      if (!shouldAlertOnBlockedStages(failedStages)) {
        logger.warn(
          {
            videoVariantReconciliationId: currentStatus.id,
            videoVariantId: currentStatus.videoVariantId,
            failedStages,
            errorMessage: currentStatus.errorMessage
          },
          'Variant blocked on Algolia indexing only; left degraded without Slack alert'
        )
        continue
      }

      const slackConfig = getMediaDataLangSlackConfig(logger)
      if (slackConfig == null) continue
      await slackChatPostMessage({
        config: slackConfig,
        body: {
          text: `Variant processing blocked after retries: ${currentStatus.videoVariantId ?? currentStatus.id}\n${currentStatus.errorMessage ?? 'Unknown blocking failure'}`
        },
        log: logger,
        failureMessage: 'Variant processing Slack alert failed',
        errorMessage: 'Variant processing Slack alert threw an error'
      })
    } catch (error) {
      logger.error(
        { error, videoVariantReconciliationId: status.id },
        'Variant reconciliation failed; continuing sweep'
      )
    }
  }
}
