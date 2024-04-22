import { NexusStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const channelAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Channel', {
    status: { not: NexusStatus.deleted },
    nexus: {
      is: {
        userNexuses: {
          some: {
            userId: user.id,
            role: 'owner'
          }
        },
        status: { not: NexusStatus.deleted }
      }
    }
  })
  can(Action.Manage, 'Channel', {
    status: { not: NexusStatus.deleted },
    nexus: {
      is: {
        userNexuses: {
          some: {
            userId: user.id,
            role: 'owner'
          }
        },
        status: { not: NexusStatus.deleted }
      }
    }
  })
}
