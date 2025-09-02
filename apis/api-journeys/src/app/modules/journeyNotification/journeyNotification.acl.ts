// import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const journeyNotificationAcl: AppAclFn = ({
  can,
  user
}: AppAclParameters) => {
  // can edit if user is owner of user
  can(Action.Manage, 'JourneyNotification', {
    userId: user.id,
    userTeam: {
      is: { userId: user.id }
    }
  })

  // can edit if user is owner of user journey
  can(Action.Manage, 'JourneyNotification', {
    userId: user.id,
    userJourney: {
      is: { userId: user.id }
    }
  })
}
