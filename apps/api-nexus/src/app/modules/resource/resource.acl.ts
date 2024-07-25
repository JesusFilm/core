import { ResourceStatus } from '.prisma/api-nexus-client'

import { Action, AppAclFn, AppAclParameters } from '../../lib/casl/caslFactory'

export const resourceAcl: AppAclFn = ({ can }: AppAclParameters) => {
  can(Action.Read, 'Resource', {
    deletedAt: { equals: null }
  })

  can(Action.Create, 'Resource', {
    status: { equals: ResourceStatus.created }
  })

  can(Action.Manage, 'Resource', {
    status: { not: ResourceStatus.created }
  })

  can(Action.Update, 'Resource', {
    deletedAt: { equals: null }
  })

  can(Action.Delete, 'Resource', {
    deletedAt: { equals: null }
  })
}
