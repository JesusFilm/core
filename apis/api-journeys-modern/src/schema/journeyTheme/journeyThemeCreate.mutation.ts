import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { JourneyThemeCreateInput } from './inputs'
import { JourneyThemeRef } from './journeyTheme'

builder.mutationField('journeyThemeCreate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: JourneyThemeRef,
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        input: t.arg({ type: JourneyThemeCreateInput, required: true })
      },
      resolve: async (query, _parent, args, context) => {
        const { input } = args

        const journey = await prisma.journey.findUnique({
          where: { id: String(input.journeyId) },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } }
          }
        })

        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !ability(Action.Update, subject('Journey', journey), context.user)
        )
          throw new GraphQLError(
            'user is not allowed to create journey theme',
            { extensions: { code: 'FORBIDDEN' } }
          )

        return await prisma.$transaction(async (tx) => {
          const existingTheme = await tx.journeyTheme.findUnique({
            where: { journeyId: String(input.journeyId) }
          })

          if (existingTheme != null)
            throw new GraphQLError('journey already has a theme', {
              extensions: { code: 'BAD_USER_INPUT' }
            })

          return tx.journeyTheme.create({
            ...query,
            data: {
              journeyId: String(input.journeyId),
              userId: context.user.id,
              headerFont: input.headerFont ?? null,
              bodyFont: input.bodyFont ?? null,
              labelFont: input.labelFont ?? null
            }
          })
        })
      }
    })
)
