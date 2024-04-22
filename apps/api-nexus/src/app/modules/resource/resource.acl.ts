import { NexusStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const resourceAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Resource', {
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
  can(Action.Manage, 'Resource', {
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
