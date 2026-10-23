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
 * What a caller asks to do to a campaign by id, as its `FORBIDDEN` message
 * names it, and the action `campaignAcl` decides it by. Publishing is
 * editing: whoever can see and change the page can put it live.
 */
const CAMPAIGN_OPERATIONS = {
  view: Action.Read,
  update: Action.Update,
  publish: Action.Update,
  unpublish: Action.Update,
  delete: Action.Delete
} as const satisfies Record<string, Action>

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
  if (!campaignAcl(CAMPAIGN_OPERATIONS[operation], campaign, user))
    throw forbidden(`user is not allowed to ${operation} campaign`)
  return campaign
}
