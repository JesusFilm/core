import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

import { TextResponseSubmissionEventCreateInput } from './inputs'

export const TextResponseSubmissionEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'TextResponseSubmissionEvent',
  isTypeOf: (obj: any) => obj.typename === 'TextResponseSubmissionEvent',
  fields: (t) => ({
    blockId: t.exposeString('blockId', { nullable: true })
  })
})

builder.mutationField('textResponseSubmissionEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    override: {
      from: 'api-journeys'
    },
    type: TextResponseSubmissionEventRef,
    args: {
      input: t.arg({
        type: TextResponseSubmissionEventCreateInput,
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
          typename: 'TextResponseSubmissionEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          label: input.label,
          value: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)
