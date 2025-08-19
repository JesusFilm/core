import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

import { SignUpSubmissionEventCreateInput } from './inputs'

export const SignUpSubmissionEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'SignUpSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'SignUpSubmissionEvent',
  fields: (t) => ({
    email: t.exposeString('email', { nullable: true })
  })
})

builder.mutationField('signUpSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: SignUpSubmissionEventRef,
    args: {
      input: t.arg({ type: SignUpSubmissionEventCreateInput, required: true })
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
          typename: 'SignUpSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.name,
          email: input.email,
          visitorId: visitor.id
        }
      })
    }
  })
)
