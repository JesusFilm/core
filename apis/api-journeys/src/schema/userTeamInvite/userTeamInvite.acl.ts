import { Prisma, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export enum Action {
  Create = 'create',
  Read = 'read',
  Manage = 'manage'
}

export type UserTeamInviteWithAcl = Prisma.UserTeamInviteGetPayload<{
  include: { team: { include: { userTeams: true } } }
}>

export const INCLUDE_USER_TEAM_INVITE_ACL = {
  team: { include: { userTeams: true } }
} satisfies Prisma.UserTeamInviteInclude

export function userTeamInviteAcl(
  action: Action,
  invite: UserTeamInviteWithAcl,
  user: User
): boolean {
  const currentUserTeam = invite.team.userTeams.find(
    (ut) => ut.userId === user.id
  )

  switch (action) {
    case Action.Create:
    case Action.Manage:
      return currentUserTeam?.role === UserTeamRole.manager
    case Action.Read:
      return (
        currentUserTeam?.role === UserTeamRole.manager ||
        currentUserTeam?.role === UserTeamRole.member
      )
    default:
      return false
  }
}
