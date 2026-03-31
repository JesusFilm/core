import { GraphQLError } from 'graphql'

import { prisma } from '@core/prisma/journeys/client'

import { Action, ability, subject } from '../../lib/auth/ability'
import { builder } from '../builder'

import {
  translateCustomizationDescription,
  translateValue
} from './translateCustomizationFields'

const JourneyCustomizationDescriptionTranslateInput = builder.inputType(
  'JourneyCustomizationDescriptionTranslateInput',
  {
    fields: (t) => ({
      journeyId: t.id({
        required: true,
        description:
          'The ID of the journey whose customization description to translate'
      }),
      sourceLanguageName: t.string({
        required: true,
        description: 'The current language of the customization description'
      }),
      targetLanguageName: t.string({
        required: true,
        description:
          'The language to translate the customization description into'
      })
    })
  }
)

builder.mutationField('journeyCustomizationDescriptionTranslate', (t) =>
  t
    .withAuth({ $any: { isAuthenticated: true, isAnonymous: true } })
    .prismaField({
      type: 'Journey',
      nullable: false,
      args: {
        input: t.arg({
          type: JourneyCustomizationDescriptionTranslateInput,
          required: true
        })
      },
      resolve: async (query, _root, { input }, { user }) => {
        const journey = await prisma.journey.findUnique({
          where: { id: input.journeyId },
          include: {
            userJourneys: true,
            journeyCustomizationFields: true,
            team: { include: { userTeams: true } }
          }
        })

        if (journey == null) {
          throw new GraphQLError('journey not found', {
            extensions: { code: 'NOT_FOUND' }
          })
        }

        if (!ability(Action.Update, subject('Journey', journey), user)) {
          throw new GraphQLError(
            'user does not have permission to update journey',
            { extensions: { code: 'FORBIDDEN' } }
          )
        }

        const hasDescription =
          journey.journeyCustomizationDescription != null &&
          journey.journeyCustomizationDescription.trim() !== ''

        const hasFields = journey.journeyCustomizationFields.length > 0

        if (!hasDescription && !hasFields) {
          return await prisma.journey.findUniqueOrThrow({
            ...query,
            where: { id: input.journeyId }
          })
        }

        const translatedDescription = hasDescription
          ? await translateCustomizationDescription({
              description: journey.journeyCustomizationDescription!,
              sourceLanguageName: input.sourceLanguageName,
              targetLanguageName: input.targetLanguageName
            })
          : null

        if (hasFields) {
          await Promise.all(
            journey.journeyCustomizationFields
              .filter((field) => field.defaultValue != null)
              .map(async (field) => {
                const translatedFieldValue = await translateValue({
                  value: field.defaultValue!,
                  sourceLanguageName: input.sourceLanguageName,
                  targetLanguageName: input.targetLanguageName
                })
                await prisma.journeyCustomizationField.update({
                  where: { id: field.id },
                  data: { value: translatedFieldValue }
                })
              })
          )
        }

        if (translatedDescription != null) {
          return await prisma.journey.update({
            ...query,
            where: { id: input.journeyId },
            data: {
              journeyCustomizationDescription: translatedDescription
            }
          })
        }

        return await prisma.journey.findUniqueOrThrow({
          ...query,
          where: { id: input.journeyId }
        })
      }
    })
)
