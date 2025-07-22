import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { EventInterface } from '../event'
import { getEventContext, getOrCreateVisitor } from '../utils'

// SignUpSubmissionEvent type
export const SignUpSubmissionEventRef = builder.prismaObject('Event', {
  interfaces: [EventInterface],
  variant: 'SignUpSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'SignUpSubmissionEvent',
  fields: (t) => ({
    email: t.exposeString('email', { nullable: true })
  })
})

// Input types
const SignUpSubmissionEventCreateInput = builder.inputType(
  'SignUpSubmissionEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      name: t.string({ required: true }),
      email: t.string({ required: true })
    })
  }
)

// Mutation: Sign Up Submission Event
builder.mutationField('signUpSubmissionEventCreate', (t) =>
  t.field({
    type: SignUpSubmissionEventRef,
    args: {
      input: t.arg({ type: SignUpSubmissionEventCreateInput, required: true })
    },
    resolve: async (_parent, args, context) => {
      const { input } = args
      const { journeyId } = await getEventContext(input.blockId)
      const visitorId = await getOrCreateVisitor(context)

      return await prisma.event.create({
        data: {
          id: input.id || uuidv4(),
          typename: 'SignUpSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.name,
          email: input.email,
          visitorId
        }
      })
    }
  })
)
