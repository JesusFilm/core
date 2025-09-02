import { builder } from '../../builder'

export const User = builder.prismaObject('User', {
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
