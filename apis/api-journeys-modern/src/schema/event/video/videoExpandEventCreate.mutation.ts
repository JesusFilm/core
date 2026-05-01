import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { VideoExpandEventCreateInput } from './inputs'
import { VideoExpandEventRef } from './videoExpandEvent'

builder.mutationField('videoExpandEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: VideoExpandEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: VideoExpandEventCreateInput, required: true })
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

      return await prisma.event.create({
        data: {
          ...(input.id != null ? { id: input.id } : {}),
          typename: 'VideoExpandEvent',
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
