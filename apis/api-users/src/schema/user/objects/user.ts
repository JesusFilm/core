import { builder } from '../../builder'

// Type for anonymous user shape
interface AnonymousUserShape {
  id: string
}
export const User = builder.prismaObject('User', {
  name: 'User',
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
    email: t.exposeString('email', { nullable: false }),
    imageUrl: t.exposeString('imageUrl'),
    superAdmin: t.exposeBoolean('superAdmin'),
    emailVerified: t.exposeBoolean('emailVerified', { nullable: false })
  })
})

export const AuthenticatedUser = builder.prismaObject('User', {
  variant: 'AuthenticatedUser',
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
