import { GraphQLError } from 'graphql'

import { Role } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

// Define Role enum
const RoleEnum = builder.enumType(Role, {
  name: 'Role'
})

// Define UserRole object type
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

// getUserRole query - matches legacy API functionality
builder.queryField('getUserRole', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserRoleRef,
    nullable: true,
    resolve: async (_parent, _args, context) => {
      const user = context.user

      try {
        return await prisma.userRole.upsert({
          where: { userId: user.id },
          create: { userId: user.id },
          update: {}
        })
      } catch (err) {
        // Handle unique constraint violations gracefully like the legacy API
        if (err instanceof Error && 'code' in err && err.code === 'P2002') {
          // Retry the operation if there was a constraint violation
          return await prisma.userRole.findUnique({
            where: { userId: user.id }
          })
        }
        throw err
      }
    }
  })
)
