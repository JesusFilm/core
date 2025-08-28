import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const visitorAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // manage visitor if visitor is current user
  can(Action.Manage, 'Visitor', {
    userId: user.id
  })
  // manage visitor as a team member
  can(Action.Manage, 'Visitor', {
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
  })
  // manage visitor as a journey owner or editor
  can(Action.Manage, 'Visitor', {
    journeyVisitors: {
      some: {
        journey: {
          is: {
            userJourneys: {
              some: {
                userId: user.id,
                role: {
                  in: [UserJourneyRole.owner, UserJourneyRole.editor]
                }
              }
            }
          }
        }
      }
    }
  })
}
