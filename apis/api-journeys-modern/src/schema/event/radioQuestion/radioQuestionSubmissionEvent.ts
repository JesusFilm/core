import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

import { RadioQuestionSubmissionEventCreateInput } from './inputs'

export const RadioQuestionSubmissionEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'RadioQuestionSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionSubmissionEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})

builder.mutationField('radioQuestionSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: RadioQuestionSubmissionEventRef,
    args: {
      input: t.arg({
        type: RadioQuestionSubmissionEventCreateInput,
        required: true
      })
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
          typename: 'RadioQuestionSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          radioOptionBlockId: input.radioOptionBlockId,
          visitorId: visitor.id
        }
      })
    }
  })
)
