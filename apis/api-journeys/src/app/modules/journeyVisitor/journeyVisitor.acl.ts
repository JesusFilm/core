import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const journeyVisitorAcl: AppAclFn = ({
  can,
  user
}: AppAclParameters) => {
  // manage journey visitor if visitor is current user
  can(Action.Manage, 'JourneyVisitor', {
    visitor: {
      is: {
        userId: user.id
      }
    }
  })
  // manage journey visitor as a team member
  can(Action.Manage, 'JourneyVisitor', {
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
  // manage journey visitor as a journey owner or editor
  can(Action.Manage, 'JourneyVisitor', {
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
  })
}
