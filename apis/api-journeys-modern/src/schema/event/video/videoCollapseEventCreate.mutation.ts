import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { VideoCollapseEventCreateInput } from './inputs'
import { VideoCollapseEventRef } from './videoCollapseEvent'

builder.mutationField('videoCollapseEventCreate', (t) =>
  t.withAuth({ $any: { isAuthenticated: true, isAnonymous: true } }).field({
    type: VideoCollapseEventRef,
    nullable: false,
    override: { from: 'api-journeys' },
    args: {
      input: t.arg({ type: VideoCollapseEventCreateInput, required: true })
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
          typename: 'VideoCollapseEvent',
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
