import { builder } from '../../../builder'
import { MessagePlatform } from '../../../enums'

export const ChatOpenEventCreateInput = builder.inputType(
  'ChatOpenEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({
        required: false,
        description:
          'ID should be unique Event UUID (Provided for optimistic mutation result matching)'
      }),
      blockId: t.id({ required: true }),
      stepId: t.id({
        required: false,
        description: 'id of the parent stepBlock'
      }),
      value: t.field({
        type: MessagePlatform,
        required: false,
        description: 'messagePlatform of the link used for chat'
      })
    })
  }
)
