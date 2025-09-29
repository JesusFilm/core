import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { validateBlockEvent } from '../utils'

import { MultiselectSubmissionEventCreateInput } from './inputs/multiselectSubmissionEventCreateInput'
import { MultiselectSubmissionEventRef } from './multiselectSubmissionEvent'

builder.mutationField('multiselectSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    nullable: false,
    type: MultiselectSubmissionEventRef,
    args: {
      input: t.arg({
        type: MultiselectSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const userId = context.user?.id

      if (!userId) {
        throw new Error('User not authenticated')
      }

      const { visitor, journeyVisitor, journeyId } = await validateBlockEvent(
        userId,
        input.blockId,
        input.stepId ?? null
      )

      const event = await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'MultiselectSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId || undefined,
          label: input.label || undefined,
          value: input.values.join(', '),
          visitorId: visitor.id
        }
      })

      await prisma.journeyVisitor.update({
        where: { journeyId_visitorId: { journeyId, visitorId: visitor.id } },
        data: { activityCount: journeyVisitor.activityCount + 1 }
      })

      return event
    }
  })
)
