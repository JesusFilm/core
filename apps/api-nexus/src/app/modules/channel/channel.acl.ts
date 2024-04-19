import { NexusStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const channelAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Channel', {
    status: NexusStatus.published,
    nexus: {
      is: {
        userNexuses: {
          some: {
            userId: user.id,
            role: 'owner'
          }
        },
        status: NexusStatus.published
      }
    }
  })
  can(Action.Manage, 'Channel', {
    status: NexusStatus.published,
    nexus: {
      is: {
        userNexuses: {
          some: {
            userId: user.id,
            role: 'owner'
          }
        },
        status: NexusStatus.published
      }
    }
  })
}
