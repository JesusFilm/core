import { builder } from '../../builder'
import { MessagePlatform } from '../../enums'

export const ChatButtonUpdateInput = builder.inputType(
  'ChatButtonUpdateInput',
  {
    fields: (t) => ({
      link: t.string({ required: false }),
      platform: t.field({ type: MessagePlatform, required: false })
    })
  }
)
