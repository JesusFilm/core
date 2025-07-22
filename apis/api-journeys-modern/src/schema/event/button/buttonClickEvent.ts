import { v4 as uuidv4 } from 'uuid'

import { ButtonAction } from '.prisma/api-journeys-modern-client'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { getEventContext, getOrCreateVisitor } from '../utils'

// Define ButtonAction enum
const ButtonActionEnum = builder.enumType('ButtonAction', {
  values: Object.values(ButtonAction)
})

// ButtonClickEvent type
export const ButtonClickEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'ButtonClickEvent',
  isTypeOf: (obj: any) => obj.typename === 'ButtonClickEvent',
  fields: (t) => ({
    action: t.expose('action', { type: ButtonActionEnum, nullable: true }),
    actionValue: t.exposeString('actionValue', { nullable: true })
  })
})

// Input types
const ButtonClickEventCreateInput = builder.inputType(
  'ButtonClickEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      action: t.field({ type: ButtonActionEnum, required: false }),
      actionValue: t.string({ required: false })
    })
  }
)

// Helper functions are imported from shared/utils

// Mutation: Button Click Event
builder.mutationField('buttonClickEventCreate', (t) =>
  t.field({
    type: ButtonClickEventRef,
    args: {
      input: t.arg({ type: ButtonClickEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'ButtonClickEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          action: input.action,
          actionValue: input.actionValue,
          visitorId
        }
      })
    }
  })
)
