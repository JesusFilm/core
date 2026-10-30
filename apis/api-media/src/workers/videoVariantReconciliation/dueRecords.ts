import { Prisma, prisma } from '@core/prisma/media/client'

import type { VideoVariantReconciliationReason } from '../../schema/videoVariantReconciliation/requestVideoVariantReconciliation'

// Reasons one edit can queue thousands of at once (a collection's children
// changing, a backfill). They re-sync Variants that are already published,
// so they can wait. User-initiated work (a publish toggle, an upload) must
// not queue behind them: the sweep works oldest first, and one JFM1 edit put
// every publish behind ~55k relationship-change records for days.
const BULK_REASONS: VideoVariantReconciliationReason[] = [
  'video-relationship-change',
  'backfill-generated-parent'
]

export async function findDueReconciliations({
  where,
  take
}: {
  where: Prisma.VideoVariantReconciliationWhereInput
  take: number
}): Promise<Array<{ id: string }>> {
  const userInitiated = await prisma.videoVariantReconciliation.findMany({
    where: { AND: [where, { reason: { notIn: BULK_REASONS } }] },
    select: { id: true },
    orderBy: { retryAt: 'asc' },
    take
  })
  if (userInitiated.length >= take) return userInitiated

  const bulk = await prisma.videoVariantReconciliation.findMany({
    where: { AND: [where, { reason: { in: BULK_REASONS } }] },
    select: { id: true },
    orderBy: { retryAt: 'asc' },
    take: take - userInitiated.length
  })
  return [...userInitiated, ...bulk]
}
