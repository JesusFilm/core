import { Prisma, prisma } from '@core/prisma/journeys/client'

/**
 * The short link ids of the QR rows that a hard delete of these journeys
 * cascades away: rows whose `journeyId` is one of them, Campaign QR Codes of
 * other teams included. A row that only targets one of them (`toJourneyId`)
 * survives the delete, so its short link stays. Read them before the delete;
 * enqueue them with `enqueueShortLinkDeletes` once it has committed.
 */
export async function findJourneyShortLinkIds(
  journeyIds: string[],
  tx: Prisma.TransactionClient = prisma
): Promise<string[]> {
  if (journeyIds.length === 0) return []
  const qrCodes = await tx.qrCode.findMany({
    where: { journeyId: { in: journeyIds } },
    select: { shortLinkId: true }
  })
  return qrCodes.map(({ shortLinkId }) => shortLinkId)
}
