import { Logger } from 'pino'

import { prisma } from '@core/prisma/media/client'

import {
  getMediaDataLangSlackConfig,
  slackChatPostMessage
} from '../../lib/slack'
import { reconcileVideoVariantReconciliation } from '../../schema/videoVariantReconciliation/reconcileVideoVariantReconciliation'
import { logger as defaultLogger } from '../lib/logger'

export async function service(logger: Logger = defaultLogger): Promise<void> {
  const dueStatuses = await prisma.videoVariantReconciliation.findMany({
    where: {
      status: { in: ['processing', 'degraded'] },
      OR: [
        { status: 'processing', retryAt: null },
        { retryAt: { lte: new Date() } }
      ]
    },
    select: { id: true }
  })

  for (const status of dueStatuses) {
    try {
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
