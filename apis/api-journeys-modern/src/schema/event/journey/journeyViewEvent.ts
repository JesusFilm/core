import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { Language } from '../../language'
import { EventInterface } from '../event'
import { getOrCreateVisitor } from '../utils'

import { JourneyViewEventCreateInput } from './inputs'

export const JourneyViewEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'JourneyViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'JourneyViewEvent',
  fields: (t) => ({
    language: t.field({
      type: Language,
      nullable: true,
      select: {
        languageId: true
      },
      resolve: async (event) => {
        if (!event.languageId) return null
        return { id: event.languageId }
      }
    })
  })
})

builder.mutationField('journeyViewEventCreate', (t) =>
  t.field({
    type: JourneyViewEventRef,
    args: {
      input: t.arg({ type: JourneyViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'JourneyViewEvent',
          journeyId: input.journeyId,
          label: input.label,
          value: input.value,
          visitorId
        }
      })
    }
  })
)
