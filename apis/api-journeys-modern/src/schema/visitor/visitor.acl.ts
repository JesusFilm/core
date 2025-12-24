import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'
import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

export interface User extends BaseUser {
  roles?: string[]
}

export function canAccessJourneyVisitors(
  action: Action,
  journey: {
    userJourneys: Array<{ userId: string; role: UserJourneyRole }>
    team: {
      userTeams: Array<{ userId: string; role: UserTeamRole }>
    } | null
  },
  user: User
): boolean {
  // Check if user is publisher
  if (user.roles?.includes('publisher')) {
    return true
  }

  // Check if user is journey owner or editor
  const userJourney = journey.userJourneys.find((uj) => uj.userId === user.id)
  if (
    userJourney &&
    (userJourney.role === UserJourneyRole.owner ||
      userJourney.role === UserJourneyRole.editor)
  ) {
    return true
  }

  // Check if user is team manager
  if (journey.team) {
    const userTeam = journey.team.userTeams.find((ut) => ut.userId === user.id)
    if (userTeam && userTeam.role === UserTeamRole.manager) {
      return true
    }
  }

  return false
}
