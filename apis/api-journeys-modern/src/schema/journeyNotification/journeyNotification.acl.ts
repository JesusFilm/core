import { User as BaseUser } from '@core/yoga/firebaseClient'

import { Action } from '../../lib/auth/ability'

// User type that includes roles
type User = BaseUser & { roles?: string[] }

export function canAccessJourneyNotification(
  action: Action,
  journeyNotification: {
    userId: string
    userTeam?: {
      userId: string
    } | null
    userJourney?: {
      userId: string
    } | null
  },
  user: User
): boolean {
  // Users can manage their own journey notifications
  if (action === Action.Manage) {
    return (
      journeyNotification.userId === user.id ||
      journeyNotification.userTeam?.userId === user.id ||
      journeyNotification.userJourney?.userId === user.id
    )
  }

  return false
}
