import { v4 as uuidv4 } from 'uuid'

import {
  CampaignRegionLanguage,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../../lib/auth/ability'
import { enqueueShortLinkDeletes } from '../../../workers/shortlinkDelete/queue'
import { logger } from '../../logger'
import {
  createShortLink,
  deleteShortLink,
  getShortLinkDomain,
  getTo,
  updateShortLink
} from '../../qrCode/qrCode.service'
import { campaignAcl } from '../campaign.acl'
import { forbidden, notFound } from '../errors'
import { renumber } from '../order'
import { INCLUDE_CAMPAIGN_REGION_ACL } from '../region/service'

/**
 * The Share Language service: every region language mutation is campaign
 * Update on the region's campaign, authorised through the Campaign as
 * aggregate root; the Campaign QR Code is created and retargeted here,
 * inside the same mutation as the link it belongs to (PRD §6). Unlinking
 * keeps it; only a region or campaign delete removes it.
 */

export const INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL = {
  region: { include: INCLUDE_CAMPAIGN_REGION_ACL },
  qrCode: true
} satisfies Prisma.CampaignRegionLanguageInclude

export type CampaignRegionLanguageWithCampaignAcl =
  Prisma.CampaignRegionLanguageGetPayload<{
    include: typeof INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL
  }>

/** Update, unlink, delete and reorder of a Share Language are campaign Update on its region's campaign. */
export async function authorizeRegionLanguageUpdate(
  id: string,
  user: User
): Promise<CampaignRegionLanguageWithCampaignAcl> {
  const regionLanguage = await prisma.campaignRegionLanguage.findUnique({
    where: { id },
    include: INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL
  })
  if (regionLanguage == null) throw notFound('region language not found')
  if (!campaignAcl(Action.Update, regionLanguage.region.campaign, user))
    throw forbidden('user is not allowed to update region language')
  return regionLanguage
}

/**
 * A short-link gateway call held back to the end of the transaction that
 * decides it, with the call that undoes it. The gateway cannot roll back with
 * the database: running the call last means a failed call rolls the
 * transaction back with nothing changed, and `revert` restores the gateway
 * should the commit itself then fail.
 */
export interface ShortLinkStep {
  apply: () => Promise<void>
  revert: () => Promise<void>
}

/**
 * Take the row lock that serialises concurrent mutations of one Share
 * Language, so a second "Use this journey" waits and re-reads `qrCodeId`
 * instead of minting a second QR row and short link.
 */
export async function lockRegionLanguage(
  tx: Prisma.TransactionClient,
  id: string
): Promise<void> {
  await tx.$queryRaw`SELECT "id" FROM "CampaignRegionLanguage" WHERE "id" = ${id} FOR UPDATE`
}

/**
 * Create the Campaign QR Code for a freshly linked journey: a `QrCode` row in
 * the campaign's team targeting the journey (no block, default colours),
 * written in `tx`, and the short link through the existing short-link create
 * as the returned step, which then saves the link's address on the row in
 * `tx` so the public page reads it without a gateway call. Should that save
 * fail, the step deletes the link it made before the transaction rolls back.
 * Returns the QR row id and that step.
 */
export async function createRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  teamId: string,
  journeyId: string
): Promise<{ qrCodeId: string; step: ShortLinkStep }> {
  const shortLinkId = uuidv4()
  const to = await getTo({ shortLinkId, toJourneyId: journeyId }, tx)
  const qrCode = await tx.qrCode.create({
    data: { teamId, journeyId, toJourneyId: journeyId, shortLinkId }
  })
  const revert = async (): Promise<void> => await deleteShortLink(shortLinkId)
  return {
    qrCodeId: qrCode.id,
    step: {
      apply: async () => {
        const { shortUrl } = await createShortLink({
          id: shortLinkId,
          hostname: getShortLinkDomain(),
          to,
          service: 'apiJourneys'
        })
        try {
          await tx.qrCode.update({
            where: { id: qrCode.id },
            data: { shortLinkUrl: shortUrl }
          })
        } catch (error) {
          await revert().catch((revertError) => {
            logger.error({ error: revertError }, 'short link revert failed')
          })
          throw error
        }
      },
      revert
    }
  }
}

/**
 * Swap the journey behind an existing Campaign QR Code: the row is updated in
 * `tx` and the same short link is retargeted by the returned step, so printed
 * codes stay valid.
 */
export async function retargetRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  qrCode: {
    id: string
    teamId: string
    shortLinkId: string
    toJourneyId: string
  },
  journeyId: string
): Promise<ShortLinkStep> {
  const to = await getTo(
    { shortLinkId: qrCode.shortLinkId, toJourneyId: journeyId },
    tx
  )
  const previousTo = await getTo(
    { shortLinkId: qrCode.shortLinkId, toJourneyId: qrCode.toJourneyId },
    tx
  )
  await tx.qrCode.update({
    where: { id: qrCode.id },
    data: { journeyId, toJourneyId: journeyId }
  })
  return {
    apply: async () => await updateShortLink({ id: qrCode.shortLinkId, to }),
    revert: async () =>
      await updateShortLink({ id: qrCode.shortLinkId, to: previousTo })
  }
}

/** Holds the step a transaction decides so it can be applied last and undone if the commit fails. */
export interface ShortLinkStepRunner {
  defer: (step: ShortLinkStep) => void
  /** Apply the deferred step; call it as the last statement of the transaction. */
  apply: () => Promise<void>
}

/** Run `transaction` with a step runner; if it fails after the step was applied, undo the step. */
export async function runWithShortLinkStep<T>(
  transaction: (runner: ShortLinkStepRunner) => Promise<T>
): Promise<T> {
  let deferred: ShortLinkStep | undefined
  let applied = false
  try {
    return await transaction({
      defer: (step) => {
        deferred = step
      },
      apply: async () => {
        await deferred?.apply()
        applied = deferred != null
      }
    })
  } catch (error) {
    if (applied && deferred != null)
      await deferred.revert().catch((revertError) => {
        logger.error({ error: revertError }, 'short link revert failed')
      })
    throw error
  }
}

/** Delete Campaign QR Code rows in `tx`; returns their short link ids for `deleteShortLinks` once the transaction has committed. */
export async function deleteQrCodes(
  tx: Prisma.TransactionClient,
  qrCodes: Array<{ id: string; shortLinkId: string }>
): Promise<string[]> {
  if (qrCodes.length === 0) return []
  await tx.qrCode.deleteMany({
    where: { id: { in: qrCodes.map((qrCode) => qrCode.id) } }
  })
  return qrCodes.map((qrCode) => qrCode.shortLinkId)
}

/**
 * Delete the short links of Campaign QR Codes whose rows are already gone:
 * call it once the transaction has committed. Each delete is a retried job on
 * the short-link delete queue, so a gateway or api-media failure is retried
 * rather than leaving a working, unreferenced short link behind.
 */
export async function deleteShortLinks(shortLinkIds: string[]): Promise<void> {
  await enqueueShortLinkDeletes(shortLinkIds)
}

/** Every Campaign QR Code owned by the given regions' Share Languages. */
export async function findRegionQrCodes(
  tx: Prisma.TransactionClient,
  where: Prisma.CampaignRegionLanguageWhereInput
): Promise<Array<{ id: string; shortLinkId: string }>> {
  const rows = await tx.campaignRegionLanguage.findMany({
    where: { ...where, qrCodeId: { not: null } },
    select: { qrCode: { select: { id: true, shortLinkId: true } } }
  })
  const seen = new Map<string, { id: string; shortLinkId: string }>()
  for (const row of rows)
    if (row.qrCode != null) seen.set(row.qrCode.id, row.qrCode)
  return [...seen.values()]
}

/** The region's Share Languages in selector order. */
export async function getRegionLanguages(
  regionId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegionLanguage[]> {
  return await tx.campaignRegionLanguage.findMany({
    where: { regionId },
    orderBy: { order: 'asc' }
  })
}

/** Renumber `CampaignRegionLanguage.order` contiguously from zero in the order given. */
export async function reorderRegionLanguages(
  regionLanguages: CampaignRegionLanguage[],
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegionLanguage[]> {
  return await renumber(
    regionLanguages,
    async (regionLanguage, order) =>
      await tx.campaignRegionLanguage.update({
        where: { id: regionLanguage.id },
        data: { order }
      })
  )
}
