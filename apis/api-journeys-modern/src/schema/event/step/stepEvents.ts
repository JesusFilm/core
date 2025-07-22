import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { getEventContext, getOrCreateVisitor } from '../utils'

// StepViewEvent type
export const StepViewEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepViewEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepViewEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})

// StepNextEvent type
export const StepNextEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepNextEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepNextEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})

// StepPreviousEvent type
export const StepPreviousEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'StepPreviousEvent',
  isTypeOf: (obj: any) => obj.typename === 'StepPreviousEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})

// Input types
const StepViewEventCreateInput = builder.inputType('StepViewEventCreateInput', {
  fields: (t) => ({
    id: t.string({ required: false }),
    blockId: t.string({ required: true }),
    value: t.string({ required: false })
  })
})

const StepNextEventCreateInput = builder.inputType('StepNextEventCreateInput', {
  fields: (t) => ({
    id: t.string({ required: false }),
    blockId: t.string({ required: true }),
    nextStepId: t.string({ required: true }),
    label: t.string({ required: false }),
    value: t.string({ required: false })
  })
})

const StepPreviousEventCreateInput = builder.inputType(
  'StepPreviousEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      previousStepId: t.string({ required: true }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)

// Mutations
builder.mutationField('stepViewEventCreate', (t) =>
  t.field({
    type: StepViewEventRef,
    args: {
      input: t.arg({ type: StepViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepViewEvent',
          journeyId,
          blockId: input.blockId,
          value: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('stepNextEventCreate', (t) =>
  t.field({
    type: StepNextEventRef,
    args: {
      input: t.arg({ type: StepNextEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepNextEvent',
          journeyId,
          blockId: input.blockId,
          nextStepId: input.nextStepId,
          label: input.label,
          value: input.value,
          visitorId
        }
      })
    }
  })
)

builder.mutationField('stepPreviousEventCreate', (t) =>
  t.field({
    type: StepPreviousEventRef,
    args: {
      input: t.arg({ type: StepPreviousEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepPreviousEvent',
          journeyId,
          blockId: input.blockId,
          previousStepId: input.previousStepId,
          label: input.label,
          value: input.value,
          visitorId
        }
      })
    }
  })
)
