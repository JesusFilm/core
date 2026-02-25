import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/users/client'
import { impersonateUser } from '@core/yoga/firebaseClient'

import { builder } from '../builder'

import { findOrFetchUser } from './findOrFetchUser'
import {
  CreateVerificationRequestInput,
  MeInput,
  UpdateMeInput
} from './inputs'
import { AnonymousUser, AuthenticatedUser, User } from './objects'
import { validateEmail } from './validateEmail'
import { verifyUser } from './verifyUser'

builder.asEntity(AuthenticatedUser, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) => {
    try {
      const user = await findOrFetchUser({}, id, undefined)

      if (user == null) {
        console.warn(`Federation: User not found for userId: ${id}`)
        return null
      }

      // Handle cases where firstName is null or empty (data integrity issue)
      // This provides a fallback to prevent GraphQL federation errors
      if (user.firstName == null || user.firstName.trim() === '') {
        console.warn(
          `Federation: User ${id} has null/empty firstName, using fallback`
        )
        return {
          ...user,
          firstName: 'Unknown User'
        }
      }

      return user
    } catch (error) {
      console.error(
        `Federation: Error resolving User entity for userId: ${id}`,
        error
      )
      return null
    }
  }
})

builder.asEntity(AnonymousUser, {
  key: builder.selection<{ id: string }>('id'),
  resolveReference: async ({ id }) => {
    return await prisma.user.findUnique({
      where: { userId: id }
    })
  }
})

builder.queryFields((t) => ({
  me: t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: User,
    nullable: true,
    args: {
      input: t.arg({
        type: MeInput,
        required: false
      })
    },
    resolve: async (_parent, { input }, ctx) => {
      const user = await findOrFetchUser(
        {},
        ctx.currentUser.id,
        input?.redirect ?? undefined,
        input?.app ?? 'NextSteps'
      )
      if (user == null) return null

      // Return appropriate type based on whether user has email
      if (user.email != null) {
        return user
      }
      // Anonymous user - only return id
      return { id: user.id }
    }
  }),
  user: t.withAuth({ isValidInterop: true }).prismaField({
    type: AuthenticatedUser,
    nullable: true,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (query, _parent, { id }) =>
      await prisma.user.findUnique({
        ...query,
        where: { userId: id }
      })
  }),
  userByEmail: t.withAuth({ isValidInterop: true }).prismaField({
    type: AuthenticatedUser,
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

builder.mutationFields((t) => ({
  userImpersonate: t.withAuth({ isSuperAdmin: true }).field({
    type: 'String',
    args: {
      email: t.arg.string({ required: true })
    },
    nullable: true,
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
  createVerificationRequest: t.withAuth({ isAuthenticated: true }).field({
    type: 'Boolean',
    args: {
      input: t.arg({
        type: CreateVerificationRequestInput,
        required: false
      })
    },
    nullable: true,
    resolve: async (_parent, { input }, ctx) => {
      if (ctx.currentUser.email == null)
        throw new GraphQLError('User email not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      await verifyUser(
        ctx.currentUser.id,
        ctx.currentUser.email,
        input?.redirect ?? undefined,
        input?.app ?? 'NextSteps'
      )
      return true
    }
  }),
  updateMe: t.withAuth({ isAnonymous: true }).field({
    description:
      "Updates the current user's firstName, lastName, and email. Only callable by anonymous users.",
    type: AuthenticatedUser,
    args: {
      input: t.arg({ type: UpdateMeInput, required: true })
    },
    nullable: true,
    resolve: async (_parent, { input }, ctx) => {
      const existingUser = await prisma.user.findUnique({
        where: { userId: ctx.currentUser.id }
      })
      if (existingUser == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      return await prisma.user.update({
        where: { userId: ctx.currentUser.id },
        data: {
          firstName: input.firstName.trim(),
          email: input.email.trim().toLowerCase(),
          ...(input.lastName != null && {
            lastName: input.lastName.trim() || null
          })
        }
      })
    }
  }),
  validateEmail: t.field({
    type: AuthenticatedUser,
    args: {
      email: t.arg.string({ required: true }),
      token: t.arg.string({ required: true })
    },
    nullable: true,
    resolve: async (_parent, { token, email }) => {
      const user = await prisma.user.findUnique({
        where: {
          email
        }
      })
      if (user == null)
        throw new GraphQLError('User not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      const validatedEmail = await validateEmail(user.userId, email, token)
      if (!validatedEmail)
        throw new GraphQLError('Invalid token', {
          extensions: { code: 'FORBIDDEN' }
        })
      return { ...user, emailVerified: true }
    }
  })
}))
