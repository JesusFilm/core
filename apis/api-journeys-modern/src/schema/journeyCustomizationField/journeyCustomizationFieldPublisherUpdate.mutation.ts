import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { parseCustomizationFieldsFromString } from '../../lib/parseCustomizationFieldsFromString'
import { recalculateJourneyCustomizable } from '../../lib/recalculateJourneyCustomizable/recalculateJourneyCustomizable'
import { builder } from '../builder'
import { canManageTemplateField } from '../journey/journey.acl'

import { JourneyCustomizationFieldRef } from './journeyCustomizationField'

builder.mutationField('journeyCustomizationFieldPublisherUpdate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: [JourneyCustomizationFieldRef],
    nullable: false,
    args: {
      journeyId: t.arg({ type: 'ID', required: true }),
      string: t.arg.string({ required: true })
    },
    resolve: async (_parent, args, context) => {
      const { journeyId, string: inputString } = args

      const journey = await prisma.journey.findUnique({
        where: { id: String(journeyId) },
        include: {
          userJourneys: true,
          team: { include: { userTeams: true } }
        }
      })

      if (journey == null)
        throw new GraphQLError('journey not found', {
          extensions: { code: 'NOT_FOUND' }
        })

      if (!canManageTemplateField(journey, context.user))
        throw new GraphQLError(
          'user is not allowed to update journey customization field',
          { extensions: { code: 'FORBIDDEN' } }
        )

      if (!journey.template)
        throw new GraphQLError('journey is not a template', {
          extensions: { code: 'FORBIDDEN' }
        })

      const customizationFields = parseCustomizationFieldsFromString(
        inputString,
        journey.id
      )

      await prisma.$transaction(async (tx) => {
        await tx.journeyCustomizationField.deleteMany({
          where: { journeyId: journey.id }
        })
        await tx.journey.update({
          where: { id: journey.id },
          data: { journeyCustomizationDescription: inputString }
        })
        await tx.journeyCustomizationField.createMany({
          data: customizationFields
        })
      })

      await recalculateJourneyCustomizable(String(journeyId))

      return prisma.journeyCustomizationField.findMany({
        where: { journeyId: journey.id }
      })
    }
  })
)
