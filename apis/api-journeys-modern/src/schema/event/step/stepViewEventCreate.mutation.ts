import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { StepViewEventCreateInput } from './inputs/stepViewEventCreateInput'
import { StepViewEventRef } from './stepViewEvent'

builder.mutationField('stepViewEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
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
