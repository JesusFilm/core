import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { Role } from './enums'

export const UserRoleRef = builder.prismaObject('UserRole', {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    roles: t.field({
      type: [Role],
      resolve: (userRole) => userRole.roles
    })
  })
})

builder.asEntity(UserRoleRef, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.userRole.findUnique({ where: { id } })
})
