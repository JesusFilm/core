import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { findOrFetchUser } from './findOrFetchUser'

export function validateIpV4(s: string | null): boolean {
  if (s == null) return true // localhost

  const match = s.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/g)
  const ip = match?.[0] ?? ''
  return (
    ip === '3.13.104.200' || // prod aws nat
    ip === '18.225.26.131' || // stage aws nat
    ip === '127.0.0.1' // localhsot
  )
}

export function isValidInterOp(token: string, address: string): boolean {
  const validIp = validateIpV4(address)
  return token === process.env.INTEROP_TOKEN && validIp
}

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
    resolve: async (query, _parent, { id }, ctx) =>
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
    // authScopes: {
    //   isAuthenticated: true
    // },
    resolve: async (query, _parent, { input }, ctx) => {
      if (input?.redirect != null) {
        return { redirect: input.redirect }
      }
      return await findOrFetchUser(ctx.currentUser?.id, input?.redirect)
    }
  })
}))
