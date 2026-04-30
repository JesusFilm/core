import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { resetEventsEmailDelay, validateBlockEvent } from '../utils'

import { VideoPlayEventCreateInput } from './inputs'
import { VideoPlayEventRef } from './videoPlayEvent'

builder.mutationField('videoPlayEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: VideoPlayEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: VideoPlayEventCreateInput, required: true })
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

      const video = await prisma.block.findUnique({
        where: { id: input.blockId },
        select: {
          duration: true,
          startAt: true,
          endAt: true
        }
      })

      const delay =
        video?.endAt != null && video?.startAt != null
          ? video.endAt - video.startAt
          : (video?.duration ?? 0)

      await resetEventsEmailDelay(journeyId, visitor.id, delay)

      return await prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'VideoPlayEvent',
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
