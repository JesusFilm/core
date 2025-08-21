import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

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
  t.withAuth({ isAuthenticated: true }).field({
    type: StepViewEventRef,
    args: {
      input: t.arg({ type: StepViewEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.blockId // Using blockId as stepId for step view events
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepViewEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.blockId,
          value: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('stepNextEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: StepNextEventRef,
    args: {
      input: t.arg({ type: StepNextEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.blockId // Using blockId as stepId for step events
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepNextEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.blockId,
          nextStepId: input.nextStepId,
          label: input.label,
          value: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)

builder.mutationField('stepPreviousEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: StepPreviousEventRef,
    args: {
      input: t.arg({ type: StepPreviousEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.blockId // Using blockId as stepId for step events
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'StepPreviousEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.blockId,
          previousStepId: input.previousStepId,
          label: input.label,
          value: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)
