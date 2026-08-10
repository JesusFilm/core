import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import {
  getMediaDataLangSlackConfig,
  slackChatPostMessage
} from '../../lib/slack'
import { reconcileVideoVariantReconciliation } from '../../schema/videoVariantReconciliation/reconcileVideoVariantReconciliation'
import { logger as defaultLogger } from '../lib/logger'

// Cap per-sweep work so a growing table can't push a single sweep past the
// worker's repeat interval (config.ts `repeat`).
const SWEEP_BATCH_SIZE = 200

// Claim window: how far forward we push retryAt before processing a record,
// so a concurrent sweep (overrun schedule, or a second replica) sees it as
// not-yet-due and skips it rather than double-processing it. Must comfortably
// exceed one record's expected processing time (Prisma + Algolia calls).
const CLAIM_DURATION_MS = 5 * 60 * 1000

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
  const dueStatuses = await prisma.videoVariantReconciliation.findMany({
    where: dueRecordWhere(),
    select: { id: true },
    orderBy: { retryAt: 'asc' },
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
            errorMessage: true
          }
        })
      if (
        currentStatus.retryAt != null ||
        currentStatus.status === 'processing'
      ) {
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
