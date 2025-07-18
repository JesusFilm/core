import { UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const JourneyCollectionAcl: AppAclFn = ({
  can,
  cannot,
  user
}: AppAclParameters) => {
  // jouorney collection as a team manager
  can([Action.Create, Action.Update, Action.Manage], 'JourneyCollection', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.manager
          }
        }
      }
    }
  })
}
