import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { VideoPauseEventCreateInput } from './inputs/videoPauseEventCreateInput'
import { VideoPauseEventRef } from './videoPauseEvent'

builder.mutationField('videoPauseEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: VideoPauseEventRef,
    args: {
      input: t.arg({ type: VideoPauseEventCreateInput, required: true })
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
          typename: 'VideoPauseEvent',
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
