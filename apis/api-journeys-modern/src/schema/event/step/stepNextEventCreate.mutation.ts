import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { StepNextEventCreateInput } from './inputs/stepNextEventCreateInput'
import { StepNextEventRef } from './stepNextEvent'

builder.mutationField('stepNextEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
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
