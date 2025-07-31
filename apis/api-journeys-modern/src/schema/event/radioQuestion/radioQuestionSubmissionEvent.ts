import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

// RadioQuestionSubmissionEvent type
export const RadioQuestionSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'RadioQuestionSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'RadioQuestionSubmissionEvent',
  fields: (t) => ({
    // No unique fields for this event type
  })
})

// Input types
const RadioQuestionSubmissionEventCreateInput = builder.inputType(
  'RadioQuestionSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      radioOptionBlockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false })
    })
  }
)

// Mutation: Radio Question Submission Event
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
