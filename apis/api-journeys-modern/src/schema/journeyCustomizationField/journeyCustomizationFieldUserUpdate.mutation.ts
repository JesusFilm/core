import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import { JourneyCustomizationFieldRef } from './journeyCustomizationField'
import { JourneyCustomizationFieldInput } from './journeyCustomizationFieldInput'

builder.mutationField('journeyCustomizationFieldUserUpdate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .field({
      type: [JourneyCustomizationFieldRef],
      nullable: false,
      override: { from: 'api-journeys' },
      args: {
        journeyId: t.arg({ type: 'ID', required: true }),
        input: t.arg({ type: [JourneyCustomizationFieldInput], required: true })
      },
      resolve: async (_parent, args, context) => {
        const { journeyId, input } = args

        const journey = await prisma.journey.findUnique({
          where: { id: String(journeyId) },
          include: {
            userJourneys: true,
            team: { include: { userTeams: true } },
            journeyCustomizationFields: true
          }
        })

        if (journey == null)
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })

        if (
          !ability(
            Action.Manage,
            subject('Journey', journey),
            context.user
          )
        )
          throw new GraphQLError(
            'user is not allowed to update journey customization field',
            { extensions: { code: 'FORBIDDEN' } }
          )

        await prisma.$transaction(async (tx) => {
          await Promise.all(
            input.map((i) =>
              tx.journeyCustomizationField.update({
                where: { id: String(i.id) },
                data: { value: i.value }
              })
            )
          )
        })

        return prisma.journeyCustomizationField.findMany({
          where: { journeyId: journey.id }
        })
      }
    })
)
