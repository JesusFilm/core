import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { findOrFetchUser } from './findOrFetchUser'

export function isCurrentUser(
  currentUserId: string,
  contextUserId: string
): boolean {
  return currentUserId === contextUserId
}

const CreateVerificationRequestInput = builder.inputType(
  'CreateVerificationRequestInput',
  {
    fields: (t) => ({
      redirect: t.string({ required: false })
    })
  }
)

const MeInput = builder.inputType('MeInput', {
  fields: (t) => ({
    redirect: t.string({ required: false })
  })
})

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
    scopeAuthOptions: {
      isValidInterOp: true
    },
    resolve: async (query, _parent, { id }, ctx) => {
      return await prisma.user.findUnique({
        ...query,
        where: { id }
      })
    }
  }),
  userByEmail: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      email: t.arg.string({ required: true })
    },
    scopeAuthOptions: {
      isValidInterOp: true
    },
    resolve: async (query, _parent, { email }, ctx) => {
      return await prisma.user.findUnique({
        ...query,
        where: { email }
      })
    }
  }),
  me: t.prismaField({
    type: 'User',
    nullable: true,
    args: {
      input: t.arg({
        type: MeInput,
        required: false
      })
    },
    authScopes: {
      isAuthenticated: true
    },
    resolve: async (query, _parent, { input }, ctx) => {
      if (ctx.currentUser?.id == null) return null
      return await findOrFetchUser(
        query,
        ctx.currentUser?.id,
        input?.redirect ?? undefined
      )
    }
  })
}))
