
import { ChannelStatus } from '../../__generated__/graphql'
import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const channelAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Channel', {
    status: { not: ChannelStatus.deleted },
  })
  can(Action.Manage, 'Channel', {
    status: { not: ChannelStatus.deleted },
  })
}
