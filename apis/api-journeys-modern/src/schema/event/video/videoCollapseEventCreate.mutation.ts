import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { VideoCollapseEventCreateInput } from './inputs/videoCollapseEventCreateInput'
import { VideoCollapseEventRef } from './videoCollapseEvent'

builder.mutationField('videoCollapseEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoCollapseEventRef,
    args: {
      input: t.arg({ type: VideoCollapseEventCreateInput, required: true })
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
        input.stepId
      )

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'VideoCollapseEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          position: input.position,
          label: input.label,
          source: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)
