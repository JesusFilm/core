import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { resetEventsEmailDelay, validateBlockEvent } from '../utils'

import { VideoCompleteEventCreateInput } from './inputs'
import { VideoCompleteEventRef } from './videoCompleteEvent'

builder.mutationField('videoCompleteEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: VideoCompleteEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: VideoCompleteEventCreateInput, required: true })
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
        input.stepId
      )

      await resetEventsEmailDelay(journeyId, visitor.id)

      return await prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'VideoCompleteEvent',
          blockId: input.blockId,
          label: input.label ?? undefined,
          value: input.value ?? undefined,
          position: input.position ?? undefined,
          visitor: { connect: { id: visitor.id } },
          journey: { connect: { id: journeyId } },
          stepId: input.stepId ?? undefined
        }
      })
    }
  })
)
