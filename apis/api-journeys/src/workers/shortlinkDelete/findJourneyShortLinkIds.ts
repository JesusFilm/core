import { Prisma, prisma } from '@core/prisma/journeys/client'

/**
 * The short link ids of every QR row that a hard delete of these journeys
 * cascades away: rows of the journey and rows targeting it, Campaign QR Codes
 * of other teams included. Read them before the delete; enqueue them with
 * `enqueueShortLinkDeletes` once it has committed.
 */
export async function findJourneyShortLinkIds(
  journeyIds: string[],
  tx: Prisma.TransactionClient = prisma
): Promise<string[]> {
  if (journeyIds.length === 0) return []
  const qrCodes = await tx.qrCode.findMany({
    where: {
      OR: [
        { journeyId: { in: journeyIds } },
        { toJourneyId: { in: journeyIds } }
      ]
    },
    select: { shortLinkId: true }
  })
  return qrCodes.map(({ shortLinkId }) => shortLinkId)
}
