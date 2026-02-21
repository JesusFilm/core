import { User as PrismaUser } from '@core/prisma/users/client'

import { builder } from '../../builder'

interface AnonymousUserShape {
  id: string
}

export type UserShape = PrismaUser | AnonymousUserShape

export const User = builder
  .interfaceRef<UserShape>('User')
  .implement({
    resolveType: (user) => {
      if ('email' in user) return 'AuthenticatedUser'
      return 'AnonymousUser'
    },
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false })
    })
  })

export const AuthenticatedUser = builder.prismaObject('User', {
  variant: 'AuthenticatedUser',
  interfaces: [User],
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    firstName: t.field({
      type: 'String',
      nullable: false,
      resolve: (user) => {
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
  interfaces: [User],
  shareable: true,
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false })
  })
})
