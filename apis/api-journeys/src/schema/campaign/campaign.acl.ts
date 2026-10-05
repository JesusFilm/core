import { Prisma, UserTeam, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export enum Action {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Manage = 'manage'
}

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
  const userTeam = campaign.team.userTeams.find((ut) => ut.userId === user.id)
  const isManager = userTeam?.role === UserTeamRole.manager
  const isMember = userTeam?.role === UserTeamRole.member

  switch (action) {
    case Action.Create:
    case Action.Read:
    case Action.Update:
      return isManager || isMember
    case Action.Manage:
    case Action.Delete:
      return isManager
    default:
      return false
  }
}
