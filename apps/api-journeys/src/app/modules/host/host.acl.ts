import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const hostAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Manage, 'Host', {
    team: {
      is: {
        userTeams: {
          some: {
            userId: user.id
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
