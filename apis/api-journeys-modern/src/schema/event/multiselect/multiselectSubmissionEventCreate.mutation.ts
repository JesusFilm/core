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
          id: input.id ?? undefined,
          typename: 'MultiselectSubmissionEvent',
          journey: { connect: { id: journeyId } },
          visitor: { connect: { id: visitor.id } },
          blockId: input.blockId,
          stepId: input.stepId ?? undefined,
          label: input.label || undefined,
          value: input.values.join(', '),
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
