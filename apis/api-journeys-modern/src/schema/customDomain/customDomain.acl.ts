import { UserTeamRole } from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

type User = BaseUser & { roles?: string[] }

export function canAccessCustomDomain(
  action: Action,
  customDomain: {
    team?: {
      userTeams: Array<{
        userId: string
        role: UserTeamRole
      }>
    }
  },
  user: User
): boolean {
  if (!customDomain.team?.userTeams) return false

  const userTeam = customDomain.team.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  if (
    action === Action.Create ||
    action === Action.Update ||
    action === Action.Manage
  ) {
    return userTeam?.role === UserTeamRole.manager
  }

  if (action === Action.Read) {
    return (
      userTeam?.role === UserTeamRole.manager ||
      userTeam?.role === UserTeamRole.member
    )
  }

  return false
}
