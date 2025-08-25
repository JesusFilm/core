import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../../lib/auth/ability'

export interface User extends BaseUser {
  roles?: string[]
}

// Check if user can read Events based on journey access
export function canAccessJourneyEvents(
  action: Action,
  journeyWithTeamAndUserJourneys: any,
  user: User
): boolean {
  switch (action) {
    case Action.Read:
      return canReadJourneyEvents(journeyWithTeamAndUserJourneys, user)
    default:
      return false
  }
}

function canReadJourneyEvents(journey: any, user: User): boolean {
  // Check if user is team manager or member
  const userTeam = journey.team?.userTeams?.find(
    (ut: any) => ut.userId === user.id
  )
  if (
    userTeam?.role === UserTeamRole.manager ||
    userTeam?.role === UserTeamRole.member
  ) {
    return true
  }

  // Check if user is journey owner (NOT editor based on legacy ACL)
  const userJourney = journey.userJourneys?.find(
    (uj: any) => uj.userId === user.id
  )
  if (userJourney?.role === UserJourneyRole.owner) {
    return true
  }

  return false
}
