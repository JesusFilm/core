import { Prisma, prisma } from '@core/prisma/media/client'

import { builder } from '../builder'
import { Language } from '../language'

const VideoVariantReconciliationStatus = builder.enumType(
  'VideoVariantReconciliationStatus',
  { values: ['processing', 'degraded', 'complete', 'failed'] as const }
)

const VideoVariantProcessingStage = builder.enumType(
  'VideoVariantProcessingStage',
  {
    values: [
      'mux',
      'parentSync',
      'downloads',
      'algoliaVideo',
      'algoliaVariant'
    ] as const
  }
)

export const VideoVariantReconciliation = builder.prismaObject(
  'VideoVariantReconciliation',
  {
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      reason: t.exposeString('reason', { nullable: false }),
      status: t.expose('status', {
        type: VideoVariantReconciliationStatus,
        nullable: false
      }),
      videoId: t.exposeID('videoId', { nullable: false }),
      edition: t.exposeString('edition', { nullable: false }),
      languageId: t.exposeID('languageId', { nullable: false }),
      language: t.field({
        type: Language,
        nullable: false,
        resolve: ({ languageId: id }) => ({ id })
      }),
      published: t.exposeBoolean('published', { nullable: false }),
      videoVariantId: t.exposeID('videoVariantId'),
      errorMessage: t.exposeString('errorMessage'),
      processingStages: t.string({
        resolve: (reconciliation) =>
          JSON.stringify(reconciliation.processingStages)
      }),
      retryAt: t.expose('retryAt', { type: 'DateTime', nullable: true }),
      createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
      videoVariant: t.relation('videoVariant')
    })
  }
)

builder.queryField('videoVariantReconciliations', (t) =>
  t.withAuth({ isPublisher: true }).prismaField({
    type: [VideoVariantReconciliation],
    args: {
      status: t.arg({
        type: VideoVariantReconciliationStatus,
        required: false
      }),
      blockingStage: t.arg({
        type: VideoVariantProcessingStage,
        required: false
      }),
      olderThan: t.arg({ type: 'DateTime', required: false }),
      minRetryCount: t.arg.int({ required: false })
    },
    resolve: async (
      query,
      _parent,
      { status, blockingStage, olderThan, minRetryCount }
    ) => {
      const stageFilters: Prisma.VideoVariantReconciliationWhereInput[] = []
      if (blockingStage != null) {
        stageFilters.push({
          processingStages: {
            path: [blockingStage, 'state'],
            equals: 'failed'
          }
        })
        if (minRetryCount != null) {
          stageFilters.push({
            processingStages: {
              path: [blockingStage, 'attempts'],
              gte: minRetryCount
            }
          })
        }
      }

      return await prisma.videoVariantReconciliation.findMany({
        ...query,
        where: {
          status: status ?? undefined,
          updatedAt: olderThan != null ? { lt: olderThan } : undefined,
          AND: stageFilters
        },
        orderBy: { updatedAt: 'asc' }
      })
    }
  })
)

builder.mutationField('videoVariantReconciliationRetry', (t) =>
  t.withAuth({ isPublisher: true }).prismaField({
    type: VideoVariantReconciliation,
    args: { id: t.arg.id({ required: true }) },
    resolve: async (query, _parent, { id }) =>
      await prisma.videoVariantReconciliation.update({
        ...query,
        where: { id },
        data: { status: 'processing', retryAt: new Date() }
      })
  })
)
