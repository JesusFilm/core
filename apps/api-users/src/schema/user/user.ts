import { GraphQLError } from 'graphql'

import { impersonateUser } from '@core/yoga/firebaseClient'

import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { findOrFetchUser } from './findOrFetchUser'
import { validateEmail } from './validateEmail'
import { verifyUser } from './verifyUser'

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
    authScopes: {
      isValidInterOp: true
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
    authScopes: {
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

builder.mutationFields((t) => ({
  userImpersonate: t.field({
    type: 'String',
    args: {
      email: t.arg.string({ required: true })
    },
    authScopes: {
      isSuperAdmin: true
    },
    resolve: async (_parent, { email }) => {
      const userToImpersonate = await prisma.user.findUnique({
        where: {
          email
        }
      })
      if (userToImpersonate?.userId == null)
        throw new GraphQLError('email does not match any user', {
          extensions: { code: 'NOT_FOUND' }
        })
      return await impersonateUser(userToImpersonate.userId)
    }
  }),
  validateEmail: t.field({
    type: User,
    args: {
      token: t.arg.string({ required: true }),
      email: t.arg.string({ required: true })
    },
    resolve: async (_parent, { token, email }) => {
      const user = await prisma.user.findUnique({
        where: {
          email
        }
      })
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: '404' }
        })

      const validatedEmail = await validateEmail(user.userId, token)
      if (!validatedEmail)
        throw new GraphQLError('Invalid token', { extensions: { code: '403' } })
      return { ...user, emailVerified: true }
    }
  }),
  createVerificationRequest: t.field({
    type: 'Boolean',
    args: {
      input: t.arg({
        type: CreateVerificationRequestInput,
        required: false
      })
    },
    authScopes: {
      isAuthenticated: true
    },
    resolve: async (_parent, { input }, ctx) => {
      if (ctx.currentUser == null)
        // only satifies typescript null check
        throw new GraphQLError('User not found', {
          extensions: { code: '404' }
        })

      await verifyUser(
        ctx.currentUser.id,
        ctx.currentUser.email,
        input?.redirect ?? undefined
      )
      return true
    }
  })
}))
