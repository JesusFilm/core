import { UserTeamRole } from '.prisma/api-journeys-client'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const hostAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  // TODO: remove when teams is released
  can(Action.Manage, 'Host', { teamId: 'jfp-team' })

  can(Action.Manage, 'Host', {
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
