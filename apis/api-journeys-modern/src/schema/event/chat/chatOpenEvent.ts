import { v4 as uuidv4 } from 'uuid'

import { prisma } from '../../../lib/prisma'
import { builder } from '../../builder'
import { MessagePlatform as MessagePlatformEnum } from '../../enums'
import { EventInterface } from '../event'
import { validateBlockEvent } from '../utils'

// ChatOpenEvent type
export const ChatOpenEventRef = builder.prismaObject('Event', {
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

// Input types
const ChatOpenEventCreateInput = builder.inputType('ChatOpenEventCreateInput', {
  fields: (t) => ({
    id: t.string({ required: false }),
    blockId: t.string({ required: true }),
    stepId: t.string({ required: false }),
    label: t.string({ required: false }),
    value: t.string({ required: false }),
    messagePlatform: t.field({ type: MessagePlatformEnum, required: false })
  })
})

// Mutation: Chat Open Event
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
          label: input.label,
          value: input.value,
          messagePlatform: input.messagePlatform,
          visitorId: visitor.id
        }
      })
    }
  })
)
