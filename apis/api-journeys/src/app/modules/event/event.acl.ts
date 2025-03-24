import { UserJourneyRole, UserTeamRole } from '.prisma/api-journeys-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const eventAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // manage event as a team member
  can(Action.Manage, 'Event', {
    visitor: {
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
  // manage event as a journey owner
  can(Action.Manage, 'Event', {
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
