import { NexusStatus, ResourceStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const resourceAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Resource', {
    status: { not: ResourceStatus.deleted },
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
  can(Action.Manage, 'Resource', {
    status: { not: ResourceStatus.deleted },
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
