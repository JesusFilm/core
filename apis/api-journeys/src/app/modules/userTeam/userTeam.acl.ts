import { UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const userTeamAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Manage, 'UserTeam', {
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
  can(Action.Read, 'UserTeam', {
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
