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
    id: t.field({
      type: 'ID',
      nullable: false,
      resolve: (user) => {
        if (user == null) return ''
        if ('userId' in user && user.userId != null) return user.userId
        if ('id' in user && user.id != null) return String(user.id)
        return ''
      }
    }),
    firstName: t.field({
      type: 'String',
      nullable: false,
      resolve: (user) => {
        const name =
          user != null && 'firstName' in user ? user.firstName : undefined
        if (name == null || (typeof name === 'string' && name.trim() === '')) {
          if (user != null && 'userId' in user) {
            console.warn(
              `User ${(user as { userId: string }).userId} has invalid firstName: "${name}", using fallback`
            )
          }
          return 'Unknown User'
        }
        return name
      }
    }),
    lastName: t.field({
      type: 'String',
      nullable: true,
      resolve: (user) =>
        user != null && 'lastName' in user ? user.lastName ?? null : null
    }),
    email: t.field({
      type: 'String',
      nullable: false,
      resolve: (user) =>
        user != null && 'email' in user ? (user.email ?? '') : ''
    }),
    imageUrl: t.field({
      type: 'String',
      nullable: true,
      resolve: (user) =>
        user != null && 'imageUrl' in user ? user.imageUrl ?? null : null
    }),
    superAdmin: t.field({
      type: 'Boolean',
      nullable: false,
      resolve: (user) =>
        user != null && 'superAdmin' in user ? user.superAdmin === true : false
    }),
    emailVerified: t.field({
      type: 'Boolean',
      nullable: false,
      resolve: (user) =>
        user != null && 'emailVerified' in user ? user.emailVerified === true : false
    })
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
