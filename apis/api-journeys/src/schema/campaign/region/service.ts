import { GraphQLError } from 'graphql'

import { CampaignRegion, Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { touchCampaign } from '../block/service'
import {
  Action,
  CampaignWithAcl,
  INCLUDE_CAMPAIGN_ACL,
  campaignAcl
} from '../campaign.acl'

/**
 * The campaign region service: every region mutation is campaign Update on
 * the region's campaign, authorised through the Campaign as aggregate root
 * exactly as the block service does.
 */

export const INCLUDE_CAMPAIGN_REGION_ACL = {
  campaign: { include: INCLUDE_CAMPAIGN_ACL }
} satisfies Prisma.CampaignRegionInclude

export type CampaignRegionWithCampaignAcl = Prisma.CampaignRegionGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_REGION_ACL
}>

/** The name every region is born with, in the campaign default language (PRD §3). */
export const NEW_REGION_NAME = 'New region'

function notFound(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'NOT_FOUND' } })
}

function forbidden(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: 'FORBIDDEN' } })
}

/** Region create is campaign Update on the campaign the region will belong to. */
export async function authorizeRegionCreate(
  campaignId: string,
  user: User
): Promise<CampaignWithAcl> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: INCLUDE_CAMPAIGN_ACL
  })
  if (campaign == null) throw notFound('campaign not found')
  if (!campaignAcl(Action.Update, campaign, user))
    throw forbidden('user is not allowed to create region')
  return campaign
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

/** The campaign's regions in switcher order. */
export async function getRegions(
  campaignId: string,
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegion[]> {
  return await tx.campaignRegion.findMany({
    where: { campaignId },
    orderBy: { order: 'asc' }
  })
}

/** Renumber `CampaignRegion.order` contiguously from zero in the order given. */
export async function reorderRegions(
  regions: CampaignRegion[],
  tx: Prisma.TransactionClient = prisma
): Promise<CampaignRegion[]> {
  return await Promise.all(
    regions.map(
      async (region, order) =>
        await tx.campaignRegion.update({
          where: { id: region.id },
          data: { order }
        })
    )
  )
}

/**
 * Move a region to `order` among the campaign's regions (clamped to the end)
 * and renumber them contiguously, inside `tx`. Returns every region.
 */
export async function moveRegion(
  tx: Prisma.TransactionClient,
  region: CampaignRegion,
  order: number
): Promise<CampaignRegion[]> {
  const all = await getRegions(region.campaignId, tx)
  const self = all.find((candidate) => candidate.id === region.id) ?? region
  const others = all.filter((candidate) => candidate.id !== region.id)
  others.splice(Math.min(order, others.length), 0, self)
  const regions = await reorderRegions(others, tx)
  await touchCampaign(tx, region.campaignId)
  return regions
}
