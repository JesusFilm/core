import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

export interface User extends BaseUser {
  roles?: string[]
}

// Check if user can manage JourneyTheme based on journey access
export function canAccessJourneyTheme(
  action: Action,
  journeyWithTeamAndUserJourneys: any,
  user: User
): boolean {
  switch (action) {
    case Action.Create:
    case Action.Update:
    case Action.Delete:
    case Action.Manage:
      return canManageJourney(journeyWithTeamAndUserJourneys, user)
    default:
      return false
  }
}

function canManageJourney(journey: any, user: User): boolean {
  // Check if user is journey owner or editor
  const userJourney = journey.userJourneys?.find(
    (uj: any) => uj.userId === user.id
  )
  if (
    userJourney?.role === UserJourneyRole.owner ||
    userJourney?.role === UserJourneyRole.editor
  ) {
    return true
  }

  // Check if user is team manager
  const userTeam = journey.team?.userTeams?.find(
    (ut: any) => ut.userId === user.id
  )
  if (userTeam?.role === UserTeamRole.manager) {
    return true
  }

  return false
}
