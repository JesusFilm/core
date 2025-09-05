import { UserJourneyRole, UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const userInviteAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // manage userInvite as a team member
  can(Action.Manage, 'UserInvite', {
    removedAt: null,
    acceptedAt: null,
    journey: {
      is: {
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
      }
    }
  })
  // manage userInvite as a journey editor
  can(Action.Manage, 'UserInvite', {
    removedAt: null,
    acceptedAt: null,
    journey: {
      is: {
        userJourneys: {
          some: {
            userId: user.id,
            role: { in: [UserJourneyRole.owner, UserJourneyRole.editor] }
          }
        }
      }
    }
  })
}
