import { builder } from '../../builder'

export const User = builder.prismaObject('User', {
  fields: (t) => ({
    id: t.exposeID('id'),
    firstName: t.exposeString('firstName'),
    lastName: t.exposeString('lastName', { nullable: true }),
    email: t.exposeString('email'),
    imageUrl: t.exposeString('imageUrl', { nullable: true }),
    superAdmin: t.exposeBoolean('superAdmin'),
    emailVerified: t.exposeBoolean('emailVerified')
  })
})
