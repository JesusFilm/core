import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const channelAcl: AppAclFn = ({ can }: AppAclParameters) => {
  can(Action.Read, 'Channel', {
    deletedAt: { equals: null }
  })

  can(Action.Create, 'Channel', {
    deletedAt: { equals: null }
  })

  can(Action.Manage, 'Channel', {
    deletedAt: { equals: null }
  })

  can(Action.Update, 'Channel', {
    deletedAt: { equals: null }
  })

  can(Action.Delete, 'Channel', {
    deletedAt: { equals: null }
  })
}
