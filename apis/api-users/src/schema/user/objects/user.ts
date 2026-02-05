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
