import { Prisma } from '@core/prisma/journeys/client'

/**
 * The campaign-level write helpers every campaign edit shares, whatever row it
 * writes: the locks that order concurrent edits of one campaign, and the
 * `updatedAt` bump each edit ends with.
 */

/**
 * Lock the campaign row until `tx` ends, so a read that follows sees the
 * latest committed state and no concurrent writer changes it underneath. Used
 * by edits that must keep the default language inside the language list.
 *
 * Lock order: a campaign edit writes its own rows (block, region, string,
 * language) and ends with `touchCampaign`, so it takes row locks before the
 * Campaign lock. A transaction that locks the Campaign row up front must take
 * the rows it will write first (`lockCampaignTextRows`,
 * `lockCampaignLanguageRows`) or it can deadlock with such an edit.
 *
 * The rule: structure → advisory lock first (`lockCampaignStructure`); rows →
 * Campaign row last. A transaction that counts or renumbers siblings or writes
 * a slot column takes the advisory lock, never this one.
 */
export async function lockCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.$queryRaw`SELECT 1 FROM "Campaign" WHERE id = ${campaignId} FOR UPDATE`
}

/**
 * Serialise the structural edits of one campaign (create, reorder, delete,
 * restore, duplicate, slot writes) until `tx` ends: take it as the first
 * statement, then read the siblings, owner or slot occupant. An advisory lock
 * never conflicts with a row lock, so these edits queue behind one another
 * and no other transaction changes its lock order.
 */
export async function lockCampaignStructure(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  // $executeRaw, not $queryRaw: pg_advisory_xact_lock returns void, which Prisma cannot deserialize.
  await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${'campaign:' + campaignId}))`
}

/**
 * Lock every block, region and string row of the campaign (in id order, soft-
 * deleted blocks included) before `lockCampaign`, matching the order of the
 * single-row edits that lock their row and then touch the campaign.
 */
export async function lockCampaignTextRows(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.$queryRaw`SELECT 1 FROM "CampaignBlock" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
  await tx.$queryRaw`SELECT 1 FROM "CampaignRegion" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
  await tx.$queryRaw`SELECT 1 FROM "CampaignString" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
}

/** Lock the campaign's language rows (in id order) before `lockCampaign`. */
export async function lockCampaignLanguageRows(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.$queryRaw`SELECT 1 FROM "CampaignLanguage" WHERE "campaignId" = ${campaignId} ORDER BY id FOR UPDATE`
}

/**
 * Every campaign edit (a block, region, string, language or theme write)
 * ends here: bump the campaign's `updatedAt`.
 */
export async function touchCampaign(
  tx: Prisma.TransactionClient,
  campaignId: string
): Promise<void> {
  await tx.campaign.update({
    where: { id: campaignId },
    data: { updatedAt: new Date() }
  })
}
