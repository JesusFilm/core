import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { getEventContext, getOrCreateVisitor } from '../utils'

// TextResponseSubmissionEvent type
export const TextResponseSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'TextResponseSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseSubmissionEvent',
  fields: (t) => ({
    blockId: t.exposeString('blockId', { nullable: true })
  })
})

// Input types
const TextResponseSubmissionEventCreateInput = builder.inputType(
  'TextResponseSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: true })
    })
  }
)

// Mutation: Text Response Submission Event
builder.mutationField('textResponseSubmissionEventCreate', (t) =>
  t.field({
    type: TextResponseSubmissionEventRef,
    args: {
      input: t.arg({
        type: TextResponseSubmissionEventCreateInput,
        required: true
      })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'TextResponseSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          visitorId
        }
      })
    }
  })
)
