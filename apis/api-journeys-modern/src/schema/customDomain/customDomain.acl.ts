import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
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
      journeys?: Array<{
        userJourneys: Array<{
          userId: string
          role: UserJourneyRole
        }>
      }>
    }
  },
  user: User
): boolean {
  if (!customDomain.team?.userTeams) return false

  const userTeam = customDomain.team.userTeams.find(
    (userTeam) => userTeam.userId === user.id
  )

  // Only team managers can create, update, manage, and delete custom domains
  if (
    action === Action.Create ||
    action === Action.Update ||
    action === Action.Manage ||
    action === Action.Delete
  ) {
    return userTeam?.role === UserTeamRole.manager
  }

  // Team managers and members can read custom domains
  if (action === Action.Read) {
    if (
      userTeam?.role === UserTeamRole.manager ||
      userTeam?.role === UserTeamRole.member
    ) {
      return true
    }

    // Journey owners and editors within the team can also read
    const journeys = customDomain.team.journeys ?? []
    return journeys.some((journey) =>
      journey.userJourneys.some(
        (uj) =>
          uj.userId === user.id &&
          (uj.role === UserJourneyRole.owner ||
            uj.role === UserJourneyRole.editor)
      )
    )
  }

  return false
}
