import { GraphQLError } from 'graphql'

import { UserRole, prisma } from '@core/prisma/journeys/client'

import { builder } from '../builder'

import { Role } from './enums'

// Define UserRole object type
const UserRoleRef = builder.prismaObject('UserRole', {
  fields: (t) => ({
    id: t.exposeID('id'),
    userId: t.exposeID('userId'),
    roles: t.field({
      type: [Role],
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

// Helper function to get or create user role
async function getUserRoleById(userId: string): Promise<UserRole> {
  try {
    return await prisma.userRole.upsert({
      where: { userId },
      create: { userId },
      update: {}
    })
  } catch (err: any) {
    // Handle unique constraint violations by retrying
    if (err.code === 'P2002') {
      return await getUserRoleById(userId)
    }
    throw err
  }
}

// getUserRole query
builder.queryField('getUserRole', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: UserRoleRef,
    nullable: true,
    resolve: async (_parent, _args, context) => {
      const user = context.user

      if (!user.id) {
        throw new GraphQLError('User not authenticated', {
          extensions: { code: 'UNAUTHENTICATED' }
        })
      }

      return await getUserRoleById(user.id)
    }
  })
)

export { UserRoleRef }
