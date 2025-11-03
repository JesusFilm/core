import { UserTeamRole } from '@core/prisma/journeys/client'

import { UserJourneyRole } from '../../__generated__/graphql'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const customDomainAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // custom domain as a team manager
  can([Action.Create, Action.Update, Action.Manage], 'CustomDomain', {
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
  // read as manager or member of team
  can(Action.Read, 'CustomDomain', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        }
      }
    }
  })
  // read as editor or owner of journey
  can(Action.Read, 'CustomDomain', {
    team: {
      is: {
        journeys: {
          some: {
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
