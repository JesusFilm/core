import { builder } from '../../../builder'
import { MessagePlatform } from '../../../enums'

export const ChatOpenEventCreateInput = builder.inputType(
  'ChatOpenEventCreateInput',
  {
    fields: (t) => ({
      id: t.id({ required: false }),
      blockId: t.id({ required: true }),
      stepId: t.id({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      messagePlatform: t.field({ type: MessagePlatform, required: false })
    })
  }
)
