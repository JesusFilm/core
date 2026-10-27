import { CampaignRegion, Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../../lib/auth/ability'
import { authorizeCampaign } from '../authorizeCampaign'
import { lockCampaignStructure, touchCampaign } from '../block/service'
import {
  CampaignWithAcl,
  INCLUDE_CAMPAIGN_ACL,
  campaignAcl
} from '../campaign.acl'
import { forbidden, notFound } from '../errors'
import { renumber } from '../order'

/**
 * The campaign region service: every region mutation is campaign Update on
 * the region's campaign, authorised through the Campaign as aggregate root
 * exactly as the block service does.
 */

export const INCLUDE_CAMPAIGN_REGION_ACL = {
  campaign: { include: { ...INCLUDE_CAMPAIGN_ACL, customDomains: true } }
} satisfies Prisma.CampaignRegionInclude

export type CampaignRegionWithCampaignAcl = Prisma.CampaignRegionGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_REGION_ACL
}>

/** The name every region is born with, in the campaign default language (GLOSSARY.md: Campaign Region). */
export const NEW_REGION_NAME = 'New region'

/** Region create is campaign Update on the campaign the region will belong to. */
export async function authorizeRegionCreate(
  campaignId: string,
  user: User
): Promise<CampaignWithAcl> {
  return await authorizeCampaign(campaignId, 'createRegion', user)
}

/** Region update, reorder, delete and country changes are campaign Update on the region's campaign. */
export async function authorizeRegionUpdate(
  regionId: string,
  user: User
): Promise<CampaignRegionWithCampaignAcl> {
  const region = await prisma.campaignRegion.findUnique({
    where: { id: regionId },
    include: INCLUDE_CAMPAIGN_REGION_ACL
  })
  if (region == null) throw notFound('region not found')
  if (!campaignAcl(Action.Update, region.campaign, user))
    throw forbidden('user is not allowed to update region')
  return region
}

/** Renumber `CampaignRegion.order` contiguously from zero in the order given. */
export async function reorderRegions(
  regions: CampaignRegion[],
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegion[]> {
  return await renumber(
    regions,
    async (region, order) =>
      await tx.campaignRegion.update({
        where: { id: region.id },
        data: { order }
      })
  )
}

/**
 * Move a region to `order` among the campaign's regions (clamped to the end)
 * and renumber them contiguously, inside `tx`, under the structure lock so a
 * concurrent move reads the order this one writes. Returns every region.
 */
export async function moveRegion(
  tx: Prisma.TransactionClient,
  region: CampaignRegion,
  order: number
): Promise<CampaignRegion[]> {
  await lockCampaignStructure(tx, region.campaignId)
  const all = await tx.campaignRegion.findMany({
    where: { campaignId: region.campaignId },
    orderBy: { order: 'asc' }
  })
  const self = all.find((candidate) => candidate.id === region.id) ?? region
  const others = all.filter((candidate) => candidate.id !== region.id)
  others.splice(Math.min(order, others.length), 0, self)
  const regions = await reorderRegions(others, tx)
  await touchCampaign(tx, region.campaignId)
  return regions
}
