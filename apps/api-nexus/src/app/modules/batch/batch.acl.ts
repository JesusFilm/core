import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const batchAcl: AppAclFn = ({ can }: AppAclParameters) => {
  can(Action.Read, 'Batch', {})

  can(Action.Create, 'Batch', {})

  can(Action.Manage, 'Batch', {})

  can(Action.Update, 'Batch', {})

  can(Action.Delete, 'Batch', {})
}
