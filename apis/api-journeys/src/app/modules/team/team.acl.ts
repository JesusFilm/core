import { UserTeamRole } from '@core/prisma/journeys/client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const teamAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Team')
  can(Action.Manage, 'Team', {
    userTeams: {
      some: {
        userId: user.id,
        role: UserTeamRole.manager
      }
    }
  })
  can(Action.Read, 'Team', {
    userTeams: {
      some: {
        userId: user.id,
        role: { in: [UserTeamRole.manager, UserTeamRole.member] }
      }
    }
  })
}
