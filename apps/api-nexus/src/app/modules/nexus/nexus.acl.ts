
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const nexusAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'UserRole', {
    userId: user.id,
    roles: {has: "publisher"}
  })
  can(Action.Manage, 'UserRole', {
    userId: user.id,
    roles: {has: "publisher"}
  })
}
