import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

const CreateVerificationRequestInput = builder.inputType(
  'CreateVerificationRequestInput',
  {
    fields: (t) => ({
      redirect: t.string()
    })
  }
)

const MeInput = builder.inputType('MeInput', {
  fields: (t) => ({
    redirect: t.string()
  })
})

export const User = builder.prismaObject('Language', {
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

builder.asEntity(User, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) =>
    await prisma.user.findUnique({ where: { id } })
})

builder.queryFields((t) => ({
  user: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) =>
      await prisma.user.findUnique({
        ...query,
        where: { id }
      })
  }),
  userByEmail: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      email: t.arg.string({ required: true })
    },
    resolve: async (query, _parent, { email }) => {
      return await prisma.user.findUnique({
        ...query,
        where: { email }
      })
    }
  })
}))
