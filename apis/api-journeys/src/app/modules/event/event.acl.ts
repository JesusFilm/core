import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const eventAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // read event as a team member
  can(Action.Read, 'Event', {
    journey: {
      is: {
        team: {
          is: {
            userTeams: {
              some: {
                userId: user.id,
                role: {
                  in: [UserTeamRole.manager, UserTeamRole.member]
                }
              }
            }
          }
        }
      }
    }
  })
  // read event as a journey owner
  can(Action.Read, 'Event', {
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: {
              in: [UserJourneyRole.owner]
            }
          }
        }
      }
    }
  })
}
