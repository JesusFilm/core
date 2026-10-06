import { GraphQLError } from 'graphql'
import { v4 as uuidv4 } from 'uuid'

import {
  CampaignRegionLanguage,
  Prisma,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import {
  createShortLink,
  deleteShortLink,
  getShortLinkDomain,
  getTo,
  updateShortLink
} from '../../qrCode/qrCode.service'
import { touchCampaign } from '../block/service'
import { Action, campaignAcl } from '../campaign.acl'
import { INCLUDE_CAMPAIGN_REGION_ACL } from '../region/service'

/**
 * The Share Language service: every region language mutation is campaign
 * Update on the region's campaign, authorised through the Campaign as
 * aggregate root; the Campaign QR Code is created, retargeted and deleted
 * here, inside the same mutation as the link it belongs to (PRD §6).
 */

export const INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL = {
  region: { include: INCLUDE_CAMPAIGN_REGION_ACL },
  qrCode: true
} satisfies Prisma.CampaignRegionLanguageInclude

export type CampaignRegionLanguageWithCampaignAcl =
  Prisma.CampaignRegionLanguageGetPayload<{
    include: typeof INCLUDE_CAMPAIGN_REGION_LANGUAGE_ACL
  }>

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

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
 * Create the Campaign QR Code for a freshly linked journey: a `QrCode` row in
 * the campaign's team targeting the journey (no block, default colours) and
 * its short link through the existing short-link create, in the same
 * transaction as the link. Returns the QR row id.
 */
export async function createRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  teamId: string,
  journeyId: string
): Promise<string> {
  const shortLinkId = uuidv4()
  const to = await getTo({ shortLinkId, teamId, toJourneyId: journeyId })
  const hostname = getShortLinkDomain()
  const shortLink = await createShortLink({
    id: shortLinkId,
    hostname,
    to,
    service: 'apiJourneys'
  })
  const qrCode = await tx.qrCode.create({
    data: {
      teamId,
      journeyId,
      toJourneyId: journeyId,
      shortLinkId: shortLink.id
    }
  })
  return qrCode.id
}

/** Swap the journey behind an existing Campaign QR Code: the same short link is retargeted, the row kept. */
export async function retargetRegionLanguageQrCode(
  tx: Prisma.TransactionClient,
  qrCode: { id: string; teamId: string; shortLinkId: string },
  journeyId: string
): Promise<void> {
  const to = await getTo({
    shortLinkId: qrCode.shortLinkId,
    teamId: qrCode.teamId,
    toJourneyId: journeyId
  })
  await updateShortLink({ id: qrCode.shortLinkId, to })
  await tx.qrCode.update({
    where: { id: qrCode.id },
    data: { journeyId, toJourneyId: journeyId }
  })
}

/** Delete Campaign QR Codes with their short links, as `qrCodeDelete` does. */
export async function deleteQrCodes(
  tx: Prisma.TransactionClient,
  qrCodes: Array<{ id: string; shortLinkId: string }>
): Promise<void> {
  if (qrCodes.length === 0) return
  for (const qrCode of qrCodes) await deleteShortLink(qrCode.shortLinkId)
  await tx.qrCode.deleteMany({
    where: { id: { in: qrCodes.map((qrCode) => qrCode.id) } }
  })
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
  return await Promise.all(
    regionLanguages.map(
      async (regionLanguage, order) =>
        await tx.campaignRegionLanguage.update({
          where: { id: regionLanguage.id },
          data: { order }
        })
    )
  )
}

/**
 * Move a Share Language to `order` among its region's languages (clamped to
 * the end) and renumber them contiguously, inside `tx`. Returns every row.
 */
export async function moveRegionLanguage(
  tx: Prisma.TransactionClient,
  regionLanguage: CampaignRegionLanguage,
  campaignId: string,
  order: number
): Promise<CampaignRegionLanguage[]> {
  const all = await getRegionLanguages(regionLanguage.regionId, tx)
  const self =
    all.find((candidate) => candidate.id === regionLanguage.id) ??
    regionLanguage
  const others = all.filter((candidate) => candidate.id !== regionLanguage.id)
  others.splice(Math.min(order, others.length), 0, self)
  const rows = await reorderRegionLanguages(others, tx)
  await touchCampaign(tx, campaignId)
  return rows
}
