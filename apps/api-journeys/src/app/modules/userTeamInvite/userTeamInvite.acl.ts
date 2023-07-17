import { UserTeamRole } from '.prisma/api-journeys-client'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const UserTeamInviteAcl: AppAclFn = ({
  can,
  user
}: AppAclParameters) => {
  can(Action.Manage, 'UserTeamInvite', {
    removedAt: null,
    acceptedAt: null,
    team: {
      is: {
        userTeams: {
          some: { userId: user.id, role: UserTeamRole.manager }
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
            role: { in: [UserTeamRole.manager, UserTeamRole.member] }
          }
        }
      }
    }
  })
}
