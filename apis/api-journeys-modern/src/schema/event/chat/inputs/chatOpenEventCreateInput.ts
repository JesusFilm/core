import { builder } from '../../../builder'
import { MessagePlatform } from '../../../enums'

export const ChatOpenEventCreateInput = builder.inputType(
  'ChatOpenEventCreateInput',
  {
    fields: (t) => ({
      id: t.string({ required: false }),
      blockId: t.string({ required: true }),
      stepId: t.string({ required: false }),
      label: t.string({ required: false }),
      value: t.string({ required: false }),
      messagePlatform: t.field({ type: MessagePlatform, required: false })
    })
  }
)
