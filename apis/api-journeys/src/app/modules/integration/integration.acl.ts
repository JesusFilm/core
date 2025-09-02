import { UserTeamRole } from '../../__generated__/graphql'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const integrationAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Manage, 'Integration', {
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
}
