import { UserTeamRole } from '.prisma/api-journeys-client'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const hostAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Manage, 'Host', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id,
            role: {
              in: [
                UserTeamRole.manager,
                UserTeamRole.member,
                // TODO: remove when teams is released
                UserTeamRole.guest
              ]
            }
          }
        }
      }
    }
  })
  can(Action.Read, 'Host', {
    team: {
      is: {
        userTeams: {
          some: { userId: user.id }
        }
      }
    }
  })
}
