import { v4 as uuidv4 } from 'uuid'

import { prisma } from '@core/prisma/journeys/client'

import { builder } from '../../builder'
import { MessagePlatform as MessagePlatformEnum } from '../../enums'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

import { ChatOpenEventCreateInput } from './inputs'

export const ChatOpenEventRef = builder.prismaObject('Event', {
  shareable: true,
  interfaces: [EventInterface],
  variant: 'ChatOpenEvent',
  isTypeOf: (obj: any) => obj.typename === 'ChatOpenEvent',
  fields: (t) => ({
    messagePlatform: t.expose('messagePlatform', {
      type: MessagePlatformEnum,
      nullable: true
    })
  })
})

builder.mutationField('chatOpenEventCreate', (t) =>
  t.withAuth({ isAuthenticated: true }).field({
    type: ChatOpenEventRef,
    args: {
      input: t.arg({ type: ChatOpenEventCreateInput, required: true })
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
          typename: 'ChatOpenEvent',
          journeyId,
          blockId: input.blockId,
          stepId: input.stepId,
          value: input.value,
          visitorId: visitor.id
        }
      })
    }
  })
)
