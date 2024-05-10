import { NexusStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const nexusAcl: AppAclFn = ({ can, user }: AppAclParameters) => {
  can(Action.Create, 'Nexus', {
    userNexuses: {
      some: {
        userId: user.id,
        role: 'owner'
      }
    },
    status: { not: NexusStatus.deleted }
  })
  can(Action.Manage, 'Nexus', {
    userNexuses: {
      some: {
        userId: user.id,
        role: 'owner'
      }
    },
    status: { not: NexusStatus.deleted }
  })
}
