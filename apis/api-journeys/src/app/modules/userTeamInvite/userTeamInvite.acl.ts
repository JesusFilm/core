import { UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const userTeamInviteAcl: AppAclFn = ({
  can,
  user
}: AppAclParameters) => {
  can(Action.Manage, 'UserTeamInvite', {
    removedAt: null,
    acceptedAt: null,
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
  can(Action.Read, 'UserTeamInvite', {
    removedAt: null,
    acceptedAt: null,
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: UserTeamRole.member
          }
        }
      }
    }
  })
}
