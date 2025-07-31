import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { getOrCreateVisitor } from '../utils'

// JourneyViewEvent type
export const JourneyViewEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'JourneyViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'JourneyViewEvent',
  fields: (t) => ({
    language: t.field({
      type: 'Json',
      nullable: true,
      resolve: async (event) => {
        if (!event.languageId) return null
        return { id: event.languageId }
      }
    })
  })
})

// Input types
const JourneyViewEventCreateInput = builder.inputType(
  'JourneyViewEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      journeyId: t.string({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)

// Mutation: Journey View Event
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
