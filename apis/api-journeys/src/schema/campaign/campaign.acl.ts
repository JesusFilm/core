import {
  Prisma,
  UserTeam,
  UserTeamRole,
  prisma
} from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

import { forbidden, notFound } from './errors'

export const INCLUDE_CAMPAIGN_ACL = {
  team: { include: { userTeams: true } }
} satisfies Prisma.CampaignInclude

export type CampaignWithAcl = Prisma.CampaignGetPayload<{
  include: typeof INCLUDE_CAMPAIGN_ACL
}>

/** The least a caller must load to decide campaign access: the team's memberships. */
export interface CampaignAclSubject {
  team: { userTeams: Array<Pick<UserTeam, 'userId' | 'role'>> }
}

/**
 * Campaign access is decided by the caller's Team Role on the owning team and
 * nothing else. `Create` is checked against the team the campaign will belong
 * to, so only the `team` relation is required.
 */
export function campaignAcl(
  action: Action,
  campaign: CampaignAclSubject,
  user: User
): boolean {
  const userTeam = campaign.team.userTeams.find(
    (membership) => membership.userId === user.id
  )
  const isManager = userTeam?.role === UserTeamRole.manager
  const isMember = userTeam?.role === UserTeamRole.member

  switch (action) {
    case Action.Create:
    case Action.Read:
    case Action.Update:
      return isManager || isMember
    case Action.Manage:
      // Publishing is editing: whoever can see and change the page can put it live.
      return isManager || isMember
    case Action.Delete:
      return isManager
    default:
      return false
  }
}

/**
 * What a caller asks to do to a campaign by id, as its `FORBIDDEN` message
 * names it, and the action `campaignAcl` decides it by.
 */
const CAMPAIGN_OPERATIONS = {
  view: Action.Read,
  update: Action.Update,
  publish: Action.Manage,
  unpublish: Action.Manage,
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
