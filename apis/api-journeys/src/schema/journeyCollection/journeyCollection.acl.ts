import { UserTeamRole } from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

// User type that includes roles
type User = BaseUser & { roles?: string[] }

export function canAccessJourneyCollection(
  action: Action,
  journeyCollection: {
    team?: {
      userTeams: Array<{
        userId: string
        role: UserTeamRole
      }>
    }
  },
  user: User
): boolean {
  if (!journeyCollection.team?.userTeams) return false

  const userTeam = journeyCollection.team.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  // Only team managers can create, update, and delete journey collections
  if (
    action === Action.Create ||
    action === Action.Update ||
    action === Action.Delete ||
    action === Action.Manage
  ) {
    return userTeam?.role === UserTeamRole.manager
  }

  // Only team managers can access journey collections (Manage implies all actions)
  if (action === Action.Read) {
    return userTeam?.role === UserTeamRole.manager
  }

  return false
}
