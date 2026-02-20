import { User as PrismaUser } from '@core/prisma/users/client'

import { builder } from '../../builder'

// Type for anonymous user shape
interface AnonymousUserShape {
  id: string
}

// Union member type
export type UserShape = PrismaUser | AnonymousUserShape

export const AuthenticatedUser = builder.prismaObject('User', {
  name: 'AuthenticatedUser',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    firstName: t.field({
      type: 'String',
      nullable: false,
      resolve: (user) => {
        // Additional safeguard for firstName field
        if (!user.firstName || user.firstName.trim() === '') {
          console.warn(
            `User ${user.userId} has invalid firstName: "${user.firstName}", using fallback`
          )
          return 'Unknown User'
        }
        return user.firstName
      }
    }),
    lastName: t.exposeString('lastName'),
    email: t.field({
      type: 'String',
      nullable: false,
      resolve: (user) => user.email ?? ''
    }),
    imageUrl: t.exposeString('imageUrl'),
    superAdmin: t.exposeBoolean('superAdmin'),
    emailVerified: t.exposeBoolean('emailVerified', { nullable: false })
  })
})

const AnonymousUserRef = builder.objectRef<AnonymousUserShape>('AnonymousUser')

export const AnonymousUser = builder.objectType(AnonymousUserRef, {
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})

export const User = builder.unionType('User', {
  types: [AuthenticatedUser, AnonymousUser],
  resolveType: (user) => {
    if ('email' in user && user.email != null) {
      return AuthenticatedUser
    }
    return AnonymousUser
  }
})

// Type guard for use in resolvers
export function isAuthenticatedUser(
  user: PrismaUser | AnonymousUserShape
): user is PrismaUser {
  return 'email' in user && user.email != null
}
