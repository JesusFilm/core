import { builder } from '../../builder'

export const User = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    firstName: t.exposeString('firstName', { nullable: false }),
    lastName: t.exposeString('lastName'),
    email: t.exposeString('email', { nullable: false }),
    imageUrl: t.exposeString('imageUrl'),
    superAdmin: t.exposeBoolean('superAdmin'),
    emailVerified: t.exposeBoolean('emailVerified', { nullable: false })
  })
})
