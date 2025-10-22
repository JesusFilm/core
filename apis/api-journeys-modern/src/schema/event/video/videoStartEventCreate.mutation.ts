import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { VideoStartEventCreateInput } from './inputs/videoStartEventCreateInput'
import { VideoStartEventRef } from './videoStartEvent'

builder.mutationField('videoStartEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoStartEventRef,
    args: {
      input: t.arg({ type: VideoStartEventCreateInput, required: true })
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
          typename: 'VideoStartEvent',
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
