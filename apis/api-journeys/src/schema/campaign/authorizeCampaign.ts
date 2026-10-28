import { Prisma, prisma } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

import {
  CampaignWithAcl,
  INCLUDE_CAMPAIGN_ACL,
  campaignAcl
} from './campaign.acl'
import { forbidden, notFound } from './errors'

/**
 * What a caller asks to do to a campaign by id: the action `campaignAcl`
 * decides it by, and what its `FORBIDDEN` message says the caller may not do.
 * Publishing is editing: whoever can see and change the page can put it live.
 * Creating a block or region is editing the campaign it will belong to.
 */
const CAMPAIGN_OPERATIONS = {
  view: { action: Action.Read, refused: 'view campaign' },
  update: { action: Action.Update, refused: 'update campaign' },
  publish: { action: Action.Update, refused: 'publish campaign' },
  unpublish: { action: Action.Update, refused: 'unpublish campaign' },
  delete: { action: Action.Delete, refused: 'delete campaign' },
  createBlock: { action: Action.Update, refused: 'create block' },
  createRegion: { action: Action.Update, refused: 'create region' }
} as const satisfies Record<string, { action: Action; refused: string }>

export type CampaignOperation = keyof typeof CAMPAIGN_OPERATIONS

/** A campaign as `authorizeCampaign` returns it: its ACL and `Include`. */
export type AuthorizedCampaign<Include extends Prisma.CampaignInclude> =
  Prisma.CampaignGetPayload<{ include: typeof INCLUDE_CAMPAIGN_ACL & Include }>

/**
 * Load a campaign with its ACL and `include`, and refuse the caller who may
 * not perform `operation` on it: `NOT_FOUND` when the id does not resolve,
 * `FORBIDDEN` when the caller's Team Role does not allow it.
 */
export async function authorizeCampaign<
  const Include extends Prisma.CampaignInclude = Record<never, never>
>(
  id: string,
  operation: CampaignOperation,
  user: User,
  include?: Include
): Promise<AuthorizedCampaign<Include>> {
  const campaign = (await prisma.campaign.findUnique({
    where: { id },
    include: { ...INCLUDE_CAMPAIGN_ACL, ...include }
  })) as (CampaignWithAcl & AuthorizedCampaign<Include>) | null
  if (campaign == null) throw notFound('campaign not found')
  const { action, refused } = CAMPAIGN_OPERATIONS[operation]
  if (!campaignAcl(action, campaign, user))
    throw forbidden(`user is not allowed to ${refused}`)
  return campaign
}
