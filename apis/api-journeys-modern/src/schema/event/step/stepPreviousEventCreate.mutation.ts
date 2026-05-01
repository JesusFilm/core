import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { StepPreviousEventCreateInput } from './inputs'
import { StepPreviousEventRef } from './stepPreviousEvent'

builder.mutationField('stepPreviousEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: StepPreviousEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: StepPreviousEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (userId == null) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.blockId
      )

      const stepPreviousEvent = await prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'StepPreviousEvent',
          blockId: input.blockId,
          previousStepId: input.previousStepId,
          label: input.label ?? undefined,
          value: input.value ?? undefined,
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } }
        }
      })

      return stepPreviousEvent
    }
  })
)
