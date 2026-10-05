import { Prisma, UserTeamRole } from '@core/prisma/journeys/client'
import { User } from '@core/yoga/firebaseClient'

export enum Action {
  Read = 'read',
  Update = 'update',
  Delete = 'delete'
}

export type UserTeamWithAcl = Prisma.UserTeamGetPayload<{
  include: { team: { include: { userTeams: true } } }
}>

export const INCLUDE_USER_TEAM_ACL = {
  team: { include: { userTeams: true } }
} satisfies Prisma.UserTeamInclude

export function userTeamAcl(
  action: Action,
  userTeam: UserTeamWithAcl,
  user: User
): boolean {
  const currentUserTeam = userTeam.team.userTeams.find(
    (ut) => ut.userId === user.id
  )

  switch (action) {
    case Action.Read:
      return (
        currentUserTeam?.role === UserTeamRole.manager ||
        currentUserTeam?.role === UserTeamRole.member
      )
    case Action.Update:
      return currentUserTeam?.role === UserTeamRole.manager
    case Action.Delete:
      return currentUserTeam?.role === UserTeamRole.manager
    default:
      return false
  }
}
