import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { StepNextEventCreateInput } from './inputs'
import { StepNextEventRef } from './stepNextEvent'

builder.mutationField('stepNextEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: StepNextEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: StepNextEventCreateInput, required: true })
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

      const stepNextEvent = await prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'StepNextEvent',
          blockId: input.blockId,
          nextStepId: input.nextStepId,
          label: input.label ?? undefined,
          value: input.value ?? undefined,
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } }
        }
      })

      return stepNextEvent
    }
  })
)
