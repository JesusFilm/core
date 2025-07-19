import { GraphQLError } from 'graphql'

import { JourneyTheme } from '.prisma/api-journeys-modern-client'

import { Action } from '../../lib/auth/ability'
import { prisma } from '../../lib/prisma'
import { builder } from '../builder'

import { JourneyThemeCreateInput, JourneyThemeUpdateInput } from './inputs'
import { canAccessJourneyTheme } from './journeyTheme.acl'

// Define input types
// Input types are now imported from ./inputs/

// Define JourneyTheme object type
const JourneyThemeRef = builder.prismaObject('JourneyTheme', {
  fields: (t) => ({
    id: t.exposeID('id'),
    journeyId: t.exposeID('journeyId'),
    userId: t.exposeID('userId'),
    headerFont: t.exposeString('headerFont', { nullable: true }),
    bodyFont: t.exposeString('bodyFont', { nullable: true }),
    labelFont: t.exposeString('labelFont', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    journey: t.relation('journey')
  })
})

// journeyTheme query - matches legacy API
builder.queryField('journeyTheme', (t) =>
  t.field({
    type: JourneyThemeRef,
    nullable: true,
    args: {
      journeyId: t.arg.id({ required: true })
    },
    resolve: async (_parent, args) => {
      const { journeyId } = args

      const journeyTheme = await prisma.journeyTheme.findUnique({
        where: { journeyId },
        include: { journey: true }
      })

      if (journeyTheme == null) {
        throw new GraphQLError('journey theme not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      return journeyTheme
    }
  })
)

// journeyThemeCreate mutation - matches legacy API
builder.mutationField('journeyThemeCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyThemeRef,
    nullable: false,
    args: {
      input: t.arg({ type: JourneyThemeCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const user = context.user

      // Check if journey exists and get authorization info
      const journey = await prisma.journey.findUnique({
        where: { id: input.journeyId },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null) {
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!canAccessJourneyTheme(Action.Create, journey, user)) {
        throw new GraphQLError('user is not allowed to create journey theme', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      return await prisma.$transaction(async (tx) => {
        // Check if theme already exists
        const existingTheme = await tx.journeyTheme.findUnique({
          where: { journeyId: input.journeyId }
        })

        if (existingTheme != null) {
          throw new GraphQLError('journey already has a theme', {
            extensions: { code: 'BAD_USER_INPUT' }
          })
        }

        // Create new theme
        return await tx.journeyTheme.create({
          data: {
            journeyId: input.journeyId,
            userId: user.id,
            headerFont: input.headerFont ?? null,
            bodyFont: input.bodyFont ?? null,
            labelFont: input.labelFont ?? null
          }
        })
      })
    }
  })
)

// journeyThemeUpdate mutation - matches legacy API
builder.mutationField('journeyThemeUpdate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyThemeRef,
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
      input: t.arg({ type: JourneyThemeUpdateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id, input } = args
      const user = context.user

      // Get theme with journey for authorization
      const journeyTheme = await prisma.journeyTheme.findUnique({
        where: { id },
        include: {
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (journeyTheme == null) {
        throw new GraphQLError('journey theme not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!canAccessJourneyTheme(Action.Update, journeyTheme.journey, user)) {
        throw new GraphQLError('user is not allowed to update journey theme', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Update theme
      return await prisma.journeyTheme.update({
        where: { id },
        data: {
          headerFont: input.headerFont ?? undefined,
          bodyFont: input.bodyFont ?? undefined,
          labelFont: input.labelFont ?? undefined
        }
      })
    }
  })
)

// journeyThemeDelete mutation - matches legacy API
builder.mutationField('journeyThemeDelete', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: JourneyThemeRef,
    nullable: false,
    args: {
      id: t.arg.id({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { id } = args
      const user = context.user

      // Get theme with journey for authorization
      const journeyTheme = await prisma.journeyTheme.findUnique({
        where: { id },
        include: {
          journey: {
            include: {
              userJourneys: true,
              team: { include: { userTeams: true } }
            }
          }
        }
      })

      if (journeyTheme == null) {
        throw new GraphQLError('journey theme not found', {
          extensions: { code: 'NOT_FOUND' }
        })
      }

      // Check authorization
      if (!canAccessJourneyTheme(Action.Delete, journeyTheme.journey, user)) {
        throw new GraphQLError('user is not allowed to delete journey theme', {
          extensions: { code: 'FORBIDDEN' }
        })
      }

      // Delete theme
      return await prisma.journeyTheme.delete({
        where: { id }
      })
    }
  })
)
