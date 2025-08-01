import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { RoleEnum } from './enums'

const UserRoleRef = builder.prismaObject('UserRole', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    roles: t.field({
      type: [RoleEnum],
      resolve: (userRole) => userRole.roles
    })
  })
})

// Register as a federated entity
builder.asEntity(UserRoleRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.userRole.findUnique({ where: { id } })
})
