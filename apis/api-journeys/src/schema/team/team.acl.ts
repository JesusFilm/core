import { Prisma, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export enum Action {
  Create = 'create',
  Read = 'read',
  Update = 'update',
  Delete = 'delete',
  Manage = 'manage'
}

export type TeamWithAcl = Prisma.TeamGetPayload<{
  include: { userTeams: true }
}>

export const INCLUDE_TEAM_ACL = {
  userTeams: true
} satisfies Prisma.TeamInclude

export function teamAcl(
  action: Action,
  team: TeamWithAcl,
  user: User
): boolean {
  const userTeam = team.userTeams.find((ut) => ut.userId === user.id)

  switch (action) {
    case Action.Create:
      return true
    case Action.Read:
      return (
        userTeam?.role === UserTeamRole.manager ||
        userTeam?.role === UserTeamRole.member
      )
    case Action.Update:
    case Action.Delete:
    case Action.Manage:
      return userTeam?.role === UserTeamRole.manager
    default:
      return false
  }
}
